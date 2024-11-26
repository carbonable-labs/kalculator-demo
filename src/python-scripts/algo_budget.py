import pulp as p
import json
import sys
from enum import Enum

from pulp import lpSum
from typing import TypedDict, Dict


class Financing(TypedDict):
    exPost: int
    exAnte: int

class Typology(TypedDict):
    nbsRemoval: int
    nbsAvoidance: int
    biochar: int
    dac: int
    blueCarbon: int


class RegionAllocation(TypedDict):
    northAmerica: int
    southAmerica: int
    europe: int
    africa: int
    asia: int
    oceania: int

class TimeConstraint(Enum):
    Yearly = 1
    FiveYear = 5
    NoConstraint = -1

class CarbonNeeds(TypedDict, total=False): 
    """
    Years are dynamic keys. Example :
    {2025: 5000, 2026: 6000}
    """
    pass

#TODO : Write asserts to verify that for each parameter, the sum of the entered fields equals 1


def yearlyAlgo(
    financing: Financing,
    typology: Typology,
    region_allocation: RegionAllocation,
    carbon_needs: Dict[int, int]
):

    """

    Parameters:
        financing : exPost and exAnte allocations.
        typology : Distribution of project typologies.
        region_allocation : Region allocation distribution.
        carbon_needs (Dict[int, int]): Carbon needs specified dynamically for various years between 2025 and 2050.

    Example:
        financing = {
        "exPost": 0.4, "exAnte": 0.6
        }
        typology = {
            "nbsRemoval": 0.5,
            "nbsAvoidance": 0.3,
            "biochar": 0.1,
            "dac": 0.05,
            "blueCarbon": 0.05
        }
        region_allocation = {
            "northAmerica": 0.1,
            "southAmerica": 0.2,
            "europe": 0.3,
            "africa": 0.2,
            "asia": 0.1,
            "oceania": 0.1
        }
        carbon_needs = {
            2025: 5_000_000,
            2040: 15_000_000,
            2050: 40_000_000
            }

    """

    Lp_prob = p.LpProblem('Kalculator_optimization', p.LpMinimize)

    ###############
    #variables
    #############

    # Geographic Regions
    regions = ["northAmerica", "southAmerica", "europe", "africa", "asia", "oceania"]

    # Project typologies and their code
    projects = {
        "NbS_ARR": 1,
        "NbS_REDD": 2,
        "DAC": 3,
        "Biochar": 4,
        "Blue_Carbon" : 5
    }

    # Purchase variables (ex-post and ex-ante) by typology, year and region
    x_vars = {}  # Ex-post purchases
    y_vars = {}  # Ex-ante purchases

    # Dynamic creation of variables for years from 1 to 26
    for project, code in projects.items():
        x_vars[project] = {
            region: [
                p.LpVariable(f"x{code}_{region}_{year}", lowBound=0)
                for year in range(1, 27)
            ] for region in regions
        }
        y_vars[project] = {
            region: [
                p.LpVariable(f"y{code}_{region}_{year}", lowBound=0)
                for year in range(1, 27)
            ] for region in regions
        }

    # z: Common upper bound variable
    z = p.LpVariable("z", lowBound=0)

    # z: Common lower bound variable (used for yearly budget strategy)
    z_min = p.LpVariable("z_min", lowBound = 0)

    # total_purch_for_on_spot_fwd : total purchases variable 'on spot vs forward' constraint
    total_purch_for_on_spot_fwd = p.LpVariable("total_purch_for_on_spot_fwd", lowBound = 0)

    # total_purch_for_typo_distrib : total purchases variable used for the typologies distribution
    total_purch_for_typo_distrib = p.LpVariable("total_purch_for_typo_distrib", lowBound = 0)

    # total_purch_for_geo_distrib : total purchases variable used for geographical areas distribution
    total_purch_for_geo_distrib = p.LpVariable("total_purch_for_geo_distrib", lowBound = 0)


    # Group all the variables into a single list
    variables = (
        # Ex-post (x) and ex-ante (y) variables for all typologies, regions, and years
        [x_vars[project][region][year]
         for project in x_vars
         for region in x_vars[project]
         for year in range(26)] +  # Ex-post variables

        [y_vars[project][region][year]
         for project in y_vars
         for region in y_vars[project]
         for year in range(26)]  # Ex-ante variables
    )


    #####################
    #Objective function
    #################


    nbs_arrRegion = {
        "northAmerica": 2.16,
        "southAmerica": 0.37,
        "europe": 2.43,
        "africa": 0.73,
        "asia": 0.91,
        "oceania": 5.43,
    }

    nbs_reddRegion = {
        "northAmerica": 0.89,
        "southAmerica": 0.29,
        "europe": 0.96,
        "africa": 0.47,
        "asia": 0.27,
        "oceania": 0.25,
    }

    dacRegion = {
        "northAmerica": 0.78,
        "southAmerica": 0.8,
        "europe": 1.33,
        "africa": 1.11,
        "asia": 0.67,
        "oceania": 1.2,
    }

    biocharRegion = {
        "northAmerica": 1.61,
        "southAmerica": 0.85,
        "europe": 2,
        "africa": 1.12,
        "asia": 1.16,
        "oceania": 1.96,
    }

    blue_carbonRegion = {
        "northAmerica": 2.27,
        "southAmerica": 0.42,
        "europe": 0.99,
        "africa": 0.39,
        "asia": 0.38,
        "oceania": 1.64,
    }

    # Coefficients per year (to be multiplied by regional factors)
    x_coefficients = {
        "NbS_ARR": [35.158035, 36.0545649, 36.9739563, 37.91679219, 38.88367039, 39.87520398,
                    40.89202168, 41.93476824, 43.00410483, 44.1007095, 45.22527759, 46.08455787,
                    46.96016446, 47.85240759, 48.76160333, 49.6880738, 50.6321472, 51.594158,
                    52.574447, 53.57336149, 54.59125536, 55.62848921, 56.68543051, 57.76245369,
                    58.85994031, 59.97827917],
        "NbS_REDD": [23.76730151, 24.31394944, 24.87317028, 25.4452532, 26.03049402, 26.62919538,
                     27.24166688, 27.86822521, 28.50919439, 29.16490586, 29.8356987, 30.37274128,
                     30.91945062, 31.47600073, 32.04256874, 32.61933498, 33.20648301, 33.8041997,
                     34.4126753, 35.03210345, 35.66268132, 36.30460958, 36.95809255, 37.62333822,
                     38.30055831, 38.98996836],
        "DAC": [618.970254, 580.5940983, 544.5972642, 510.8322338, 479.1606353, 449.4526759,
                421.58661, 395.4482402, 370.9304493, 347.9327614, 326.3609302, 322.1182381,
                317.930701, 313.7976019, 309.7182331, 305.6918961, 301.7179014, 297.7955687,
                293.9242263, 290.1032114, 286.3318696, 282.6095553, 278.9356311, 275.3094679,
                271.7304448, 268.197949],
        "Biochar": [135.7778991, 130.55045, 125.5242577, 120.6915738, 116.0449482, 111.5772177,
                    107.2814948, 103.1511572, 99.17983769, 95.36141394, 91.6899995, 89.81035451,
                    87.96924225, 86.16587278, 84.39947239, 82.66928321, 80.9745629, 79.31458436,
                    77.68863538, 76.09601836, 74.53604998, 73.00806095, 71.5113957, 70.04541209,
                    68.60948115, 67.20298678],
        "Blue_Carbon": [108.68, 104.66, 100.79,  97.06,  93.47,  90.01,  86.68,  83.47,  80.39,  
                        77.41,  74.55,  72.72,  70.94,  69.20,  67.51,  65.85,  64.24,  62.66,
                            61.13,  59.63,  58.17,  56.75,  55.36,  54.00,  52.68,  51.39]
    }

    # Generation of coefficients by region, project, and year
    regional_coefficients = {
        "x": {},
        "y": {}
    }

    for project, base_coefficients in x_coefficients.items():
        regional_coefficients["x"][project] = {
            region: [c * factor for c in base_coefficients]
            for region, factor in eval(f"{project.lower()}Region").items()
        }
        regional_coefficients["y"][project] = {
            region: [c * 0.87 for c in regional_coefficients["x"][project][region]]
             for region in regional_coefficients["x"][project]
        }


    # Objective function
    Lp_prob += (
        # NbS-ARR
        lpSum(
            regional_coefficients["x"]["NbS_ARR"][region][year] *
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["NbS_ARR"][region][year] *
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            regional_coefficients["x"]["NbS_REDD"][region][year] *
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["NbS_REDD"][region][year] *
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            regional_coefficients["x"]["Biochar"][region][year] *
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["Biochar"][region][year] *
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            regional_coefficients["x"]["DAC"][region][year] *
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["DAC"][region][year] *
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            regional_coefficients["x"]["Blue_Carbon"][region][year] *
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["Blue_Carbon"][region][year] *
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    #################
    # Constraints
    ###############


    ##Constraint : Yearly budget timeline##

    Lp_prob += z_min >= 0.015 * (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    for year in range(26):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year] +
                y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
                for region in regions
            ) +

            # NbS-REDD
            lpSum(
                x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year] +
                y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
                for region in regions
            ) +

            # Biochar
            lpSum(
                x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year] +
                y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
                for region in regions
            ) +

            # DAC
            lpSum(
                x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year] +
                y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
                for region in regions
            ) +

             # Blue_Carbon
            lpSum(
                x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year] +
                y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
                for region in regions
            ) >= z_min
        )


    ##Contraint : balanced upper bound of purchases per year##

    Lp_prob += z <= 0.15 * (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    for year in range(26):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year] +
                y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
                for region in regions
            ) +

            # NbS-REDD
            lpSum(
                x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year] +
                y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
                for region in regions
            ) +

            # Biochar
            lpSum(
                x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year] +
                y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
                for region in regions
            ) +

            # DAC
            lpSum(
                x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year] +
                y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
                for region in regions
            ) +

            # Blue_Carbon
            lpSum(
                x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year] +
                y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
                for region in regions
            ) <= z
        )


    ##Constraint : On spot vs Forward##

    Lp_prob += (
        total_purch_for_on_spot_fwd ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    Lp_prob += (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

         # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
          == financing["exPost"] * total_purch_for_on_spot_fwd
    )



    Lp_prob += (
        # NbS-ARR
        lpSum(
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )

          == financing["exAnte"] * total_purch_for_on_spot_fwd
    )


    ##Constraint : distribution of project typologies##


    Lp_prob += (
        total_purch_for_typo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    # NbS-ARR
    Lp_prob += (
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsRemoval"] * total_purch_for_typo_distrib
    )


    #NbS-REDD
    Lp_prob += (
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsAvoidance"] * total_purch_for_typo_distrib
    )


    #DAC
    Lp_prob += (
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["dac"]* total_purch_for_typo_distrib
    )


    #Biochar
    Lp_prob += (
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["biochar"] * total_purch_for_typo_distrib
    )


    #Blue_Carbon
    Lp_prob += (
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["blueCarbon"] * total_purch_for_typo_distrib
    )


    ##Constraint : distribution of geographical areas##

    Lp_prob += (
        total_purch_for_geo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    # northAmerica
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["northAmerica"][year] +
            y_vars["NbS_ARR"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["northAmerica"][year] +
            y_vars["NbS_REDD"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["northAmerica"][year] +
            y_vars["Biochar"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["northAmerica"][year] +
            y_vars["DAC"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["northAmerica"][year] +
            y_vars["Blue_Carbon"]["northAmerica"][year]
            for year in range(26)
        )
    )== region_allocation["northAmerica"] * total_purch_for_typo_distrib
    )


    # southAmerica
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["southAmerica"][year] +
            y_vars["NbS_ARR"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["southAmerica"][year] +
            y_vars["NbS_REDD"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["southAmerica"][year] +
            y_vars["Biochar"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["southAmerica"][year] +
            y_vars["DAC"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["southAmerica"][year] +
            y_vars["Blue_Carbon"]["southAmerica"][year]
            for year in range(26)
        )
    )== region_allocation["southAmerica"] * total_purch_for_typo_distrib
    )


    # europe
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["europe"][year] +
            y_vars["NbS_ARR"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["europe"][year] +
            y_vars["NbS_REDD"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["europe"][year] +
            y_vars["Biochar"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["europe"][year] +
            y_vars["DAC"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["europe"][year] +
            y_vars["Blue_Carbon"]["europe"][year]
            for year in range(26)
        )
    )== region_allocation["europe"] * total_purch_for_typo_distrib
    )


    # africa
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["africa"][year] +
            y_vars["NbS_ARR"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["africa"][year] +
            y_vars["NbS_REDD"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["africa"][year] +
            y_vars["Biochar"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["africa"][year] +
            y_vars["DAC"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["africa"][year] +
            y_vars["Blue_Carbon"]["africa"][year]
            for year in range(26)
        )
    )== region_allocation["africa"] * total_purch_for_typo_distrib
    )


    # asia
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["asia"][year] +
            y_vars["NbS_ARR"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["asia"][year] +
            y_vars["NbS_REDD"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["asia"][year] +
            y_vars["Biochar"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["asia"][year] +
            y_vars["DAC"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["asia"][year] +
            y_vars["Blue_Carbon"]["asia"][year]
            for year in range(26)
        )
    )== region_allocation["asia"] * total_purch_for_typo_distrib
    )



    # oceania
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["oceania"][year] +
            y_vars["NbS_ARR"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["oceania"][year] +
            y_vars["NbS_REDD"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["oceania"][year] +
            y_vars["Biochar"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["oceania"][year] +
            y_vars["DAC"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["oceania"][year] +
            y_vars["Blue_Carbon"]["oceania"][year]
            for year in range(26)
        )
    )== region_allocation["oceania"] * total_purch_for_typo_distrib
    )


    ##Constraint : carbon units needs by years##

    # Definition of exAnte coefficients for each category
    coefficients = {
        "NbS_ARR": [0.99592, 0.99592, 0.99592, 0.97068, 0.97068, 0.97068, 0.97068, 
                    0.81757, 0.81757, 0.81757, 0.81757, 0.37754, 0.37754, 0.37754, 
                    0.37754, 0.07585, 0.07585, 0.07585, 0.07585, 0.01098, 0.01098, 
                    0.01098, 0.01098, 0, 0, 0],

        "other_types": [1, 1, 1, 0.834, 0.834, 0.834, 0.834, 0.667, 0.667, 0.667, 0.667,
                     0.5, 0.5, 0.5, 0.5, 0.334, 0.334, 0.334, 0.334, 0.167, 0.167,
                     0.167, 0.167, 0, 0, 0],
    }


    
    for year, need in carbon_needs.items():
        year = int(year)
        year_index = year - 2025  
        start_index = 25 - year_index  

        Lp_prob += (
            lpSum(
                x_vars["NbS_ARR"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["NbS_REDD"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["DAC"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["Biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["Blue_Carbon"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +

            
            lpSum(
                coefficients["NbS_ARR"][start_index:][t] * y_vars["NbS_ARR"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["NbS_REDD"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["DAC"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["Biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["Blue_Carbon"][region][t]
                for region in regions
                for t in range(year_index + 1)
            )
        ) >= need



    #################
    ##Solving
    ##############


    Lp_prob.solve(p.PULP_CBC_CMD(msg=False))

    results = []
    
    for project, code in projects.items():
        for region in regions:
            for i, year in enumerate(range(1, 27)):  
                x_var = x_vars[project][region][i]
                x_value = x_var.value()
                if x_value > 0:
                    results.append({
                        "year": 2024+year,
                        "quantity": x_value,
                        "typology": project,
                        "region": region,
                        "price": coefficients["x"][project][region][i] if "x" in coefficients and project in coefficients["x"] else None,
                        "type": "ex-post"
                    })

                y_var = y_vars[project][region][i]
                y_value = y_var.value()
                if y_value > 0:
                    results.append({
                        "year": 2024+year,
                        "quantity": y_value,
                        "typology": project,
                        "region": region,
                        "price": coefficients["y"][project][region][i] if "y" in coefficients and project in coefficients["y"] else None,
                        "type": "ex-ante"
                    })
    
    return {
        "results": results,
        "total_price": Lp_prob.objective.value()
    }


def fiveYearAlgo(
    financing: Financing,
    typology: Typology,
    region_allocation: RegionAllocation,
    carbon_needs: Dict[int, int]):

    """

    Parameters:
        financing : exPost and exAnte allocations.
        typology : Distribution of project typologies.
        region_allocation : Region allocation distribution.
        carbon_needs (Dict[int, int]): Carbon needs specified dynamically for various years between 2025 and 2050 (step = 5 due to budget strategy).

    Example:
        financing = {
        "exPost": 0.4, "exAnte": 0.6
        }
        typology = {
            "nbsRemoval": 0.5,
            "nbsAvoidance": 0.3,
            "biochar": 0.1,
            "dac": 0.05,
            "blueCarbon": 0.05
        }
        region_allocation = {
            "northAmerica": 0.1,
            "southAmerica": 0.2,
            "europe": 0.3,
            "africa": 0.2,
            "asia": 0.1,
            "oceania": 0.1
        }
        carbon_needs = {
            2025: 5_000_000,
            2030: 15_000_000,
            2035: 15_000_000,
            2040: 17_000_000,
            2045: 22_000_000,
            2050: 40_000_000
            }
    """

    Lp_prob = p.LpProblem('Kalculator_optimization', p.LpMinimize)

    ####################
    #Variables
    ##################

    # Geographic Regions
    regions = ["northAmerica", "southAmerica", "europe", "africa", "asia", "oceania"]

    # Project typologies and their code
    projects = {
        "NbS_ARR": 1,
        "NbS_REDD": 2,
        "DAC": 3,
        "Biochar": 4,
        "Blue_Carbon" : 5
    }

    # Purchase variables (ex-post and ex-ante) by typology, year and region
    x_vars = {}  # Ex-post purchases
    y_vars = {}  # Ex-ante purchases

    # Dynamic creation of variables for years from 1 to 26 (step of 5)
    for project, code in projects.items():
        x_vars[project] = {
            region: [
                p.LpVariable(f"x{code}_{region}_{year}", lowBound=0)
                for year in range(1, 27, 5)
            ] for region in regions
        }
        y_vars[project] = {
            region: [
                p.LpVariable(f"y{code}_{region}_{year}", lowBound=0)
                for year in range(1, 27, 5)
            ] for region in regions
        }

    # z: Common upper bound variable
    z = p.LpVariable("z", lowBound=0)

    # z: Common lower bound variable (used for 5 years budget strategy)
    z_min = p.LpVariable("z_min", lowBound = 0)

    # total_purch_for_on_spot_fwd : total purchases variable 'on spot vs forward' constraint
    total_purch_for_on_spot_fwd = p.LpVariable("total_purch_for_on_spot_fwd", lowBound = 0)

    # total_purch_for_typo_distrib : total purchases variable used for the typologies distribution
    total_purch_for_typo_distrib = p.LpVariable("total_purch_for_typo_distrib", lowBound = 0)

    # total_purch_for_geo_distrib : total purchases variable used for geographical areas distribution
    total_purch_for_geo_distrib = p.LpVariable("total_purch_for_geo_distrib", lowBound = 0)



    # Group all the variables into a single list
    variables = (
        # Ex-post (x) and ex-ante (y) variables for all typologies, regions, and years
        [x_vars[project][region][year]
         for project in x_vars
         for region in x_vars[project]
         for year in range(6)] +  # Ex-post variables

        [y_vars[project][region][year]
         for project in y_vars
         for region in y_vars[project]
         for year in range(6)]  # Ex-ante variables
    )


    ########################
    #Objective function
    ######################

    nbs_arrRegion = {
        "northAmerica": 2.16,
        "southAmerica": 0.37,
        "europe": 2.43,
        "africa": 0.73,
        "asia": 0.91,
        "oceania": 5.43,
    }

    nbs_reddRegion = {
        "northAmerica": 0.89,
        "southAmerica": 0.29,
        "europe": 0.96,
        "africa": 0.47,
        "asia": 0.27,
        "oceania": 0.25,
    }

    dacRegion = {
        "northAmerica": 0.78,
        "southAmerica": 0.8,
        "europe": 1.33,
        "africa": 1.11,
        "asia": 0.67,
        "oceania": 1.2,
    }

    biocharRegion = {
        "northAmerica": 1.61,
        "southAmerica": 0.85,
        "europe": 2,
        "africa": 1.12,
        "asia": 1.16,
        "oceania": 1.96,
    }

    blue_carbonRegion = {
        "northAmerica": 2.27,
        "southAmerica": 0.42,
        "europe": 0.99,
        "africa": 0.39,
        "asia": 0.38,
        "oceania": 1.64,
    }

    # Coefficients per year (to be multiplied by regional factors)
    x_coefficients = {
        "NbS_ARR": [35.158035, 39.87520398, 45.22527759, 49.6880738, 54.59125536, 59.97827917],
        "NbS_REDD": [23.76730151, 26.62919538, 29.8356987, 32.61933498, 35.66268132, 38.98996836],
        "DAC": [618.970254, 449.4526759, 326.3609302, 305.6918961, 286.3318696, 268.197949],
        "Biochar": [135.7778991, 111.5772177, 91.6899995, 82.66928321, 74.53604998, 67.20298678],
        "Blue_Carbon": [108.68, 90.01, 74.55, 65.85, 58.17, 51.39]
    }

    # Generation of coefficients by region, project, and year
    regional_coefficients = {
        "x": {},
        "y": {}
    }

    for project, base_coefficients in x_coefficients.items():
        regional_coefficients["x"][project] = {
            region: [c * factor for c in base_coefficients]
            for region, factor in eval(f"{project.lower()}Region").items()
        }
        regional_coefficients["y"][project] = {
            region: [c * 0.87 for c in regional_coefficients["x"][project][region]]
             for region in regional_coefficients["x"][project]
        }


    # Objective function
    Lp_prob += (
        # NbS-ARR
        lpSum(
            regional_coefficients["x"]["NbS_ARR"][region][year] *
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["NbS_ARR"][region][year] *
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            regional_coefficients["x"]["NbS_REDD"][region][year] *
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["NbS_REDD"][region][year] *
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            regional_coefficients["x"]["Biochar"][region][year] *
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["Biochar"][region][year] *
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            regional_coefficients["x"]["DAC"][region][year] *
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["DAC"][region][year] *
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            regional_coefficients["x"]["Blue_Carbon"][region][year] *
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["Blue_Carbon"][region][year] *
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
    )



    ###############################
    ### Constraints
    ############################

    ##Constraint : 5 years budget timeline##

    Lp_prob += z_min >= 0.015 * (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
    )


    for year in range(6):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year] +
                y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
                for region in regions
            ) +

            # NbS-REDD
            lpSum(
                x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year] +
                y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
                for region in regions
            ) +

            # Biochar
            lpSum(
                x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year] +
                y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
                for region in regions
            ) +

            # DAC
            lpSum(
                x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year] +
                y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
                for region in regions
            ) +

             # Blue_Carbon
            lpSum(
                x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year] +
                y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
                for region in regions
            ) >= z_min
        )


    #Contraint : balanced upper bound of purchases per year

    Lp_prob += z <= 0.40 * (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
    )


    for year in range(6):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year] +
                y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
                for region in regions
            ) +

            # NbS-REDD
            lpSum(
                x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year] +
                y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
                for region in regions
            ) +

            # Biochar
            lpSum(
                x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year] +
                y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
                for region in regions
            ) +

            # DAC
            lpSum(
                x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year] +
                y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
                for region in regions
            ) +

            # Blue_Carbon
            lpSum(
                x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year] +
                y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
                for region in regions
            ) <= z
        )




    #Constraint : On spot vs Forward

    Lp_prob += (
        total_purch_for_on_spot_fwd ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
    )


    Lp_prob += (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

         # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
          == financing["exPost"] * total_purch_for_on_spot_fwd
    )



    Lp_prob += (
        # NbS-ARR
        lpSum(
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )

          == financing["exAnte"] * total_purch_for_on_spot_fwd
    )



    #Constraint : distribution of project typologies


    Lp_prob += (
        total_purch_for_typo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
    )


    # NbS-ARR
    Lp_prob += (
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["nbsRemoval"] * total_purch_for_typo_distrib
    )



    #NbS-REDD
    Lp_prob += (
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["nbsAvoidance"] * total_purch_for_typo_distrib
    )


    #DAC
    Lp_prob += (
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["dac"]* total_purch_for_typo_distrib
    )


    #Biochar
    Lp_prob += (
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["biochar"] * total_purch_for_typo_distrib
    )



    #Blue_Carbon
    Lp_prob += (
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["blueCarbon"] * total_purch_for_typo_distrib
    )


    #Constraint : distribution of geographical areas


    Lp_prob += (
        total_purch_for_geo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(6)
        )
    )


    # northAmerica
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["northAmerica"][year] +
            y_vars["NbS_ARR"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["northAmerica"][year] +
            y_vars["NbS_REDD"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Biochar"]["northAmerica"][year] +
            y_vars["Biochar"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["DAC"]["northAmerica"][year] +
            y_vars["DAC"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["northAmerica"][year] +
            y_vars["Blue_Carbon"]["northAmerica"][year]
            for year in range(6)
        )
    )== region_allocation["northAmerica"] * total_purch_for_typo_distrib
    )


    # southAmerica
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["southAmerica"][year] +
            y_vars["NbS_ARR"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["southAmerica"][year] +
            y_vars["NbS_REDD"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Biochar"]["southAmerica"][year] +
            y_vars["Biochar"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["DAC"]["southAmerica"][year] +
            y_vars["DAC"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["southAmerica"][year] +
            y_vars["Blue_Carbon"]["southAmerica"][year]
            for year in range(6)
        )
    )== region_allocation["southAmerica"] * total_purch_for_typo_distrib
    )


    # europe
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["europe"][year] +
            y_vars["NbS_ARR"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["europe"][year] +
            y_vars["NbS_REDD"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Biochar"]["europe"][year] +
            y_vars["Biochar"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["DAC"]["europe"][year] +
            y_vars["DAC"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["europe"][year] +
            y_vars["Blue_Carbon"]["europe"][year]
            for year in range(6)
        )
    )== region_allocation["europe"] * total_purch_for_typo_distrib
    )


    # africa
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["africa"][year] +
            y_vars["NbS_ARR"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["africa"][year] +
            y_vars["NbS_REDD"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Biochar"]["africa"][year] +
            y_vars["Biochar"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["DAC"]["africa"][year] +
            y_vars["DAC"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["africa"][year] +
            y_vars["Blue_Carbon"]["africa"][year]
            for year in range(6)
        )
    )== region_allocation["africa"] * total_purch_for_typo_distrib
    )


    # asia
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["asia"][year] +
            y_vars["NbS_ARR"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["asia"][year] +
            y_vars["NbS_REDD"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Biochar"]["asia"][year] +
            y_vars["Biochar"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["DAC"]["asia"][year] +
            y_vars["DAC"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["asia"][year] +
            y_vars["Blue_Carbon"]["asia"][year]
            for year in range(6)
        )
    )== region_allocation["asia"] * total_purch_for_typo_distrib
    )


    # oceania
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["oceania"][year] +
            y_vars["NbS_ARR"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["oceania"][year] +
            y_vars["NbS_REDD"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Biochar"]["oceania"][year] +
            y_vars["Biochar"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["DAC"]["oceania"][year] +
            y_vars["DAC"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["oceania"][year] +
            y_vars["Blue_Carbon"]["oceania"][year]
            for year in range(6)
        )
    )== region_allocation["oceania"] * total_purch_for_typo_distrib
    )


    # Definition of exAnte coefficients for each category
    coefficients = {

        "NbS_ARR": [0.99592, 0.97068, 0.81757, 0.07585, 0.01098, 0],

        "other_types": [1, 0.834, 0.667, 0.334, 0.167, 0],
    }


    for year, need in carbon_needs.items():
        year_index = (year - 2025)//5  
        start_index = 5 - year_index  

        Lp_prob += (
            
            lpSum(
                x_vars["NbS_ARR"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["NbS_REDD"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["DAC"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["Biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["Blue_Carbon"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +

            
            lpSum(
                coefficients["NbS_ARR"][start_index:][t] * y_vars["NbS_ARR"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["NbS_REDD"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["DAC"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["Biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["Blue_Carbon"][region][t]
                for region in regions
                for t in range(year_index + 1)
            )
        ) >= need


    Lp_prob.solve(p.PULP_CBC_CMD(msg=False))


    results = []
    
    for project, code in projects.items():
        for region in regions:
            for i, year in enumerate(range(1, 27, 5)):  
                x_var = x_vars[project][region][i]
                x_value = x_var.value()
                if x_value > 0:
                    results.append({
                        "year": 2024+year,
                        "quantity": x_value,
                        "typology": project,
                        "region": region,
                        "price": coefficients["x"][project][region][i] if "x" in coefficients and project in coefficients["x"] else None,
                        "type": "ex-post"
                    })

                y_var = y_vars[project][region][i]
                y_value = y_var.value()
                if y_value > 0:
                    results.append({
                        "year": 2024+year,
                        "quantity": y_value,
                        "typology": project,
                        "region": region,
                        "price": coefficients["y"][project][region][i] if "y" in coefficients and project in coefficients["y"] else None,
                        "type": "ex-ante"
                    })
    
    return {
        "results": results,
        "total_price": Lp_prob.objective.value()
    }



def flexibleAlgo(
    financing: Financing,
    typology: Typology,
    region_allocation: RegionAllocation,
    carbon_needs: Dict[int, int]
):

    """

    Parameters:
        financing : exPost and exAnte allocations.
        typology : Distribution of project typologies.
        region_allocation : Region allocation distribution.
        carbon_needs (Dict[int, int]): Carbon needs specified dynamically for various years between 2025 and 2050.

    Example:
        financing = {
        "exPost": 0.4, "exAnte": 0.6
        }
        typology = {
            "nbsRemoval": 0.5,
            "nbsAvoidance": 0.3,
            "biochar": 0.1,
            "dac": 0.05,
            "blueCarbon": 0.05
        }
        region_allocation = {
            "northAmerica": 0.1,
            "southAmerica": 0.2,
            "europe": 0.3,
            "africa": 0.2,
            "asia": 0.1,
            "oceania": 0.1
        }
        carbon_needs = {
            2025: 5_000_000,
            2040: 15_000_000,
            2050: 40_000_000
            }

    """

    Lp_prob = p.LpProblem('Kalculator_optimization', p.LpMinimize)

    ###############
    #variables
    #############

    # Geographic Regions
    regions = ["northAmerica", "southAmerica", "europe", "africa", "asia", "oceania"]

    # Project typologies and their code
    projects = {
        "NbS_ARR": 1,
        "NbS_REDD": 2,
        "DAC": 3,
        "Biochar": 4,
        "Blue_Carbon" : 5
    }

    # Purchase variables (ex-post and ex-ante) by typology, year and region
    x_vars = {}  # Ex-post purchases
    y_vars = {}  # Ex-ante purchases

    # Dynamic creation of variables for years from 1 to 26
    for project, code in projects.items():
        x_vars[project] = {
            region: [
                p.LpVariable(f"x{code}_{region}_{year}", lowBound=0)
                for year in range(1, 27)
            ] for region in regions
        }
        y_vars[project] = {
            region: [
                p.LpVariable(f"y{code}_{region}_{year}", lowBound=0)
                for year in range(1, 27)
            ] for region in regions
        }

    # z: Common upper bound variable
    z = p.LpVariable("z", lowBound=0)

    # total_purch_for_on_spot_fwd : total purchases variable 'on spot vs forward' constraint
    total_purch_for_on_spot_fwd = p.LpVariable("total_purch_for_on_spot_fwd", lowBound = 0)

    # total_purch_for_typo_distrib : total purchases variable used for the typologies distribution
    total_purch_for_typo_distrib = p.LpVariable("total_purch_for_typo_distrib", lowBound = 0)

    # total_purch_for_geo_distrib : total purchases variable used for geographical areas distribution
    total_purch_for_geo_distrib = p.LpVariable("total_purch_for_geo_distrib", lowBound = 0)


    # Group all the variables into a single list
    variables = (
        # Ex-post (x) and ex-ante (y) variables for all typologies, regions, and years
        [x_vars[project][region][year]
         for project in x_vars
         for region in x_vars[project]
         for year in range(26)] +  # Ex-post variables

        [y_vars[project][region][year]
         for project in y_vars
         for region in y_vars[project]
         for year in range(26)]  # Ex-ante variables
    )


    #####################
    #Objective function
    #################


    nbs_arrRegion = {
        "northAmerica": 2.16,
        "southAmerica": 0.37,
        "europe": 2.43,
        "africa": 0.73,
        "asia": 0.91,
        "oceania": 5.43,
    }

    nbs_reddRegion = {
        "northAmerica": 0.89,
        "southAmerica": 0.29,
        "europe": 0.96,
        "africa": 0.47,
        "asia": 0.27,
        "oceania": 0.25,
    }

    dacRegion = {
        "northAmerica": 0.78,
        "southAmerica": 0.8,
        "europe": 1.33,
        "africa": 1.11,
        "asia": 0.67,
        "oceania": 1.2,
    }

    biocharRegion = {
        "northAmerica": 1.61,
        "southAmerica": 0.85,
        "europe": 2,
        "africa": 1.12,
        "asia": 1.16,
        "oceania": 1.96,
    }

    blue_carbonRegion = {
        "northAmerica": 2.27,
        "southAmerica": 0.42,
        "europe": 0.99,
        "africa": 0.39,
        "asia": 0.38,
        "oceania": 1.64,
    }

    # Coefficients per year (to be multiplied by regional factors)
    x_coefficients = {
        "NbS_ARR": [35.158035, 36.0545649, 36.9739563, 37.91679219, 38.88367039, 39.87520398,
                    40.89202168, 41.93476824, 43.00410483, 44.1007095, 45.22527759, 46.08455787,
                    46.96016446, 47.85240759, 48.76160333, 49.6880738, 50.6321472, 51.594158,
                    52.574447, 53.57336149, 54.59125536, 55.62848921, 56.68543051, 57.76245369,
                    58.85994031, 59.97827917],
        "NbS_REDD": [23.76730151, 24.31394944, 24.87317028, 25.4452532, 26.03049402, 26.62919538,
                     27.24166688, 27.86822521, 28.50919439, 29.16490586, 29.8356987, 30.37274128,
                     30.91945062, 31.47600073, 32.04256874, 32.61933498, 33.20648301, 33.8041997,
                     34.4126753, 35.03210345, 35.66268132, 36.30460958, 36.95809255, 37.62333822,
                     38.30055831, 38.98996836],
        "DAC": [618.970254, 580.5940983, 544.5972642, 510.8322338, 479.1606353, 449.4526759,
                421.58661, 395.4482402, 370.9304493, 347.9327614, 326.3609302, 322.1182381,
                317.930701, 313.7976019, 309.7182331, 305.6918961, 301.7179014, 297.7955687,
                293.9242263, 290.1032114, 286.3318696, 282.6095553, 278.9356311, 275.3094679,
                271.7304448, 268.197949],
        "Biochar": [135.7778991, 130.55045, 125.5242577, 120.6915738, 116.0449482, 111.5772177,
                    107.2814948, 103.1511572, 99.17983769, 95.36141394, 91.6899995, 89.81035451,
                    87.96924225, 86.16587278, 84.39947239, 82.66928321, 80.9745629, 79.31458436,
                    77.68863538, 76.09601836, 74.53604998, 73.00806095, 71.5113957, 70.04541209,
                    68.60948115, 67.20298678],
        "Blue_Carbon": [108.68, 104.66, 100.79,  97.06,  93.47,  90.01,  86.68,  83.47,  80.39,  
                        77.41,  74.55,  72.72,  70.94,  69.20,  67.51,  65.85,  64.24,  62.66,
                            61.13,  59.63,  58.17,  56.75,  55.36,  54.00,  52.68,  51.39]
    }

    # Generation of coefficients by region, project, and year
    regional_coefficients = {
        "x": {},
        "y": {}
    }

    for project, base_coefficients in x_coefficients.items():
        regional_coefficients["x"][project] = {
            region: [c * factor for c in base_coefficients]
            for region, factor in eval(f"{project.lower()}Region").items()
        }
        regional_coefficients["y"][project] = {
            region: [c * 0.87 for c in regional_coefficients["x"][project][region]]
             for region in regional_coefficients["x"][project]
        }


    # Objective function
    Lp_prob += (
        # NbS-ARR
        lpSum(
            regional_coefficients["x"]["NbS_ARR"][region][year] *
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["NbS_ARR"][region][year] *
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            regional_coefficients["x"]["NbS_REDD"][region][year] *
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["NbS_REDD"][region][year] *
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            regional_coefficients["x"]["Biochar"][region][year] *
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["Biochar"][region][year] *
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            regional_coefficients["x"]["DAC"][region][year] *
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["DAC"][region][year] *
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            regional_coefficients["x"]["Blue_Carbon"][region][year] *
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["Blue_Carbon"][region][year] *
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    #################
    # Constraints
    ###############

    ##Contraint : balanced upper bound of purchases per year##

    Lp_prob += z <= 0.3 * (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    for year in range(26):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["NbS_ARR"][region][year] * regional_coefficients["x"]["NbS_ARR"][region][year] +
                y_vars["NbS_ARR"][region][year] * regional_coefficients["y"]["NbS_ARR"][region][year]
                for region in regions
            ) +

            # NbS-REDD
            lpSum(
                x_vars["NbS_REDD"][region][year] * regional_coefficients["x"]["NbS_REDD"][region][year] +
                y_vars["NbS_REDD"][region][year] * regional_coefficients["y"]["NbS_REDD"][region][year]
                for region in regions
            ) +

            # Biochar
            lpSum(
                x_vars["Biochar"][region][year] * regional_coefficients["x"]["Biochar"][region][year] +
                y_vars["Biochar"][region][year] * regional_coefficients["y"]["Biochar"][region][year]
                for region in regions
            ) +

            # DAC
            lpSum(
                x_vars["DAC"][region][year] * regional_coefficients["x"]["DAC"][region][year] +
                y_vars["DAC"][region][year] * regional_coefficients["y"]["DAC"][region][year]
                for region in regions
            ) +

            # Blue_Carbon
            lpSum(
                x_vars["Blue_Carbon"][region][year] * regional_coefficients["x"]["Blue_Carbon"][region][year] +
                y_vars["Blue_Carbon"][region][year] * regional_coefficients["y"]["Blue_Carbon"][region][year]
                for region in regions
            ) <= z
        )


    ##Constraint : On spot vs Forward##

    Lp_prob += (
        total_purch_for_on_spot_fwd ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    Lp_prob += (
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

         # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
          == financing["exPost"] * total_purch_for_on_spot_fwd
    )



    Lp_prob += (
        # NbS-ARR
        lpSum(
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )

          == financing["exAnte"] * total_purch_for_on_spot_fwd
    )


    ##Constraint : distribution of project typologies##


    Lp_prob += (
        total_purch_for_typo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    # NbS-ARR
    Lp_prob += (
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsRemoval"] * total_purch_for_typo_distrib
    )


    #NbS-REDD
    Lp_prob += (
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsAvoidance"] * total_purch_for_typo_distrib
    )


    #DAC
    Lp_prob += (
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["dac"]* total_purch_for_typo_distrib
    )


    #Biochar
    Lp_prob += (
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["biochar"] * total_purch_for_typo_distrib
    )


    #Blue_Carbon
    Lp_prob += (
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["blueCarbon"] * total_purch_for_typo_distrib
    )


    ##Constraint : distribution of geographical areas##

    Lp_prob += (
        total_purch_for_geo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["NbS_ARR"][region][year] +
            y_vars["NbS_ARR"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # NbS-REDD
        lpSum(
            x_vars["NbS_REDD"][region][year] +
            y_vars["NbS_REDD"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Biochar
        lpSum(
            x_vars["Biochar"][region][year] +
            y_vars["Biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # DAC
        lpSum(
            x_vars["DAC"][region][year] +
            y_vars["DAC"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # Blue_Carbon
        lpSum(
            x_vars["Blue_Carbon"][region][year] +
            y_vars["Blue_Carbon"][region][year]
            for region in regions
            for year in range(26)
        )
    )


    # northAmerica
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["northAmerica"][year] +
            y_vars["NbS_ARR"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["northAmerica"][year] +
            y_vars["NbS_REDD"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["northAmerica"][year] +
            y_vars["Biochar"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["northAmerica"][year] +
            y_vars["DAC"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["northAmerica"][year] +
            y_vars["Blue_Carbon"]["northAmerica"][year]
            for year in range(26)
        )
    )== region_allocation["northAmerica"] * total_purch_for_typo_distrib
    )


    # southAmerica
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["southAmerica"][year] +
            y_vars["NbS_ARR"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["southAmerica"][year] +
            y_vars["NbS_REDD"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["southAmerica"][year] +
            y_vars["Biochar"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["southAmerica"][year] +
            y_vars["DAC"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["southAmerica"][year] +
            y_vars["Blue_Carbon"]["southAmerica"][year]
            for year in range(26)
        )
    )== region_allocation["southAmerica"] * total_purch_for_typo_distrib
    )


    # europe
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["europe"][year] +
            y_vars["NbS_ARR"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["europe"][year] +
            y_vars["NbS_REDD"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["europe"][year] +
            y_vars["Biochar"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["europe"][year] +
            y_vars["DAC"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["europe"][year] +
            y_vars["Blue_Carbon"]["europe"][year]
            for year in range(26)
        )
    )== region_allocation["europe"] * total_purch_for_typo_distrib
    )


    # africa
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["africa"][year] +
            y_vars["NbS_ARR"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["africa"][year] +
            y_vars["NbS_REDD"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["africa"][year] +
            y_vars["Biochar"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["africa"][year] +
            y_vars["DAC"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["africa"][year] +
            y_vars["Blue_Carbon"]["africa"][year]
            for year in range(26)
        )
    )== region_allocation["africa"] * total_purch_for_typo_distrib
    )


    # asia
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["asia"][year] +
            y_vars["NbS_ARR"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["asia"][year] +
            y_vars["NbS_REDD"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["asia"][year] +
            y_vars["Biochar"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["asia"][year] +
            y_vars["DAC"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["asia"][year] +
            y_vars["Blue_Carbon"]["asia"][year]
            for year in range(26)
        )
    )== region_allocation["asia"] * total_purch_for_typo_distrib
    )



    # oceania
    Lp_prob += ((
        lpSum(
            x_vars["NbS_ARR"]["oceania"][year] +
            y_vars["NbS_ARR"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["NbS_REDD"]["oceania"][year] +
            y_vars["NbS_REDD"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Biochar"]["oceania"][year] +
            y_vars["Biochar"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["DAC"]["oceania"][year] +
            y_vars["DAC"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["Blue_Carbon"]["oceania"][year] +
            y_vars["Blue_Carbon"]["oceania"][year]
            for year in range(26)
        )
    )== region_allocation["oceania"] * total_purch_for_typo_distrib
    )


    ##Constraint : carbon units needs by years##

    # Definition of exAnte coefficients for each category
    coefficients = {
        "NbS_ARR": [0.99592, 0.99592, 0.99592, 0.97068, 0.97068, 0.97068, 0.97068, 
                    0.81757, 0.81757, 0.81757, 0.81757, 0.37754, 0.37754, 0.37754, 
                    0.37754, 0.07585, 0.07585, 0.07585, 0.07585, 0.01098, 0.01098, 
                    0.01098, 0.01098, 0, 0, 0],

        "other_types": [1, 1, 1, 0.834, 0.834, 0.834, 0.834, 0.667, 0.667, 0.667, 0.667,
                     0.5, 0.5, 0.5, 0.5, 0.334, 0.334, 0.334, 0.334, 0.167, 0.167,
                     0.167, 0.167, 0, 0, 0],
    }

    for year, need in carbon_needs.items():
        year_index = year - 2025  
        start_index = 25 - year_index  

        Lp_prob += (
            
            lpSum(
                x_vars["NbS_ARR"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["NbS_REDD"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["DAC"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["Biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["Blue_Carbon"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +

            
            lpSum(
                coefficients["NbS_ARR"][start_index:][t] * y_vars["NbS_ARR"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["NbS_REDD"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["DAC"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["Biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] * y_vars["Blue_Carbon"][region][t]
                for region in regions
                for t in range(year_index + 1)
            )
        ) >= need



    #################
    ##Solving
    ##############


    Lp_prob.solve(p.PULP_CBC_CMD(msg=False))


    results = []
    
    for project, code in projects.items():
        for region in regions:
            for i, year in enumerate(range(1, 27)):  
                x_var = x_vars[project][region][i]
                x_value = x_var.value()
                if x_value > 0:
                    results.append({
                        "year": 2024+year,
                        "quantity": x_value,
                        "typology": project,
                        "region": region,
                        "price": coefficients["x"][project][region][i] if "x" in coefficients and project in coefficients["x"] else None,
                        "type": "ex-post"
                    })

                y_var = y_vars[project][region][i]
                y_value = y_var.value()
                if y_value > 0:
                    results.append({
                        "year": 2024+year,
                        "quantity": y_value,
                        "typology": project,
                        "region": region,
                        "price": coefficients["y"][project][region][i] if "y" in coefficients and project in coefficients["y"] else None,
                        "type": "ex-ante"
                    })
    
    return {
        "results": results,
        "total_price": Lp_prob.objective.value()
    }


financing = {
        "exPost": 0.4, "exAnte": 0.6
        }
typology = {
    "nbsRemoval": 0.5,
    "nbsAvoidance": 0.3,
    "biochar": 0.1,
    "dac": 0.05,
    "blueCarbon": 0.05
}
region_allocation = {
    "northAmerica": 0.1,
    "southAmerica": 0.2,
    "europe": 0.3,
    "africa": 0.2,
    "asia": 0.1,
    "oceania": 0.1
}
carbon_needs = {
    2025: 5_000_000,
    2040: 10_000_000,
    2050: 40_000_000
    }

def algo(input_data):
    # Exemple de traitement (remplacez par votre logique réelle)
    financing = input_data.get("financing", {})
    result = financing.get("exPost", 0) + financing.get("exAnte", 0)
    return result
    
if __name__ == "__main__":

    # Lire les arguments JSON
    input_json = json.loads(sys.argv[1])

    # Récupérer les données
    financing = input_json.get("financing", {})
    typology = input_json.get("typology", {})
    region_llocation = input_json.get("region_allocation", {})
    # carbon_needs = input_json.get("carbonNeeds", {})
    time_constraints = input_json.get("timeConstraint", {})

    carbonNeeds: {
      2025: 5000000,
      2040: 10000000,
      2050: 40000000,
    }

    # Exécuter l'algorithme
    result = yearlyAlgo(financing, typology, region_allocation, carbon_needs)

    print(json.dumps(result))