import pulp as p
import json
import sys
from enum import Enum

from pulp import lpSum
from typing import TypedDict, Dict

from models import Financing, Typology, RegionAllocation, TimeConstraint, CarbonNeeds
from constants import (x_coefficients, coefficients, regional_factors)


# TODO : Write asserts to verify that for each parameter, the sum of the entered fields equals 1


def yearlyAlgo(
    financing: Financing,
    typology: Typology,
    region_allocation: RegionAllocation,
    carbon_needs: Dict[int, int],
    optimizeFinancing: bool
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
            "renewableEnergy": 0.05
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
    # variables
    #############

    # Geographic Regions
    regions = ["northAmerica", "southAmerica",
               "europe", "africa", "asia", "oceania"]

    # Project typologies and their code
    projects = {
        "nbsRemoval": 1,
        "nbsAvoidance": 2,
        "dac": 3,
        "biochar": 4,
        "renewableEnergy": 5
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
    z_min = p.LpVariable("z_min", lowBound=0)

    # total_purch_for_on_spot_fwd : total purchases variable 'on spot vs forward' constraint
    total_purch_for_on_spot_fwd = p.LpVariable(
        "total_purch_for_on_spot_fwd", lowBound=0)

    # total_purch_for_typo_distrib : total purchases variable used for the typologies distribution
    total_purch_for_typo_distrib = p.LpVariable(
        "total_purch_for_typo_distrib", lowBound=0)

    # total_purch_for_geo_distrib : total purchases variable used for geographical areas distribution
    total_purch_for_geo_distrib = p.LpVariable(
        "total_purch_for_geo_distrib", lowBound=0)

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
    # Objective function
    #################

    # Generation of coefficients by region, project, and year
    regional_coefficients = {
        "x": {},
        "y": {}
    }

    for project, base_coefficients in x_coefficients.items():
        # Obtenir les facteurs régionaux pour le projet
        project_region_factors = regional_factors[project]
        regional_coefficients["x"][project] = {
            region: [c * factor for c in base_coefficients]
            for region, factor in project_region_factors.items()
        }
        regional_coefficients["y"][project] = {
            region: [c * 0.87 for c in regional_coefficients["x"][project][region]]
            for region in regional_coefficients["x"][project]
        }

    # Objective function
    Lp_prob += (
        # NbS-ARR
        lpSum(
            regional_coefficients["x"]["nbsRemoval"][region][year] *
            x_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["nbsRemoval"][region][year] *
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            regional_coefficients["x"]["nbsAvoidance"][region][year] *
            x_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["nbsAvoidance"][region][year] *
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            regional_coefficients["x"]["biochar"][region][year] *
            x_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["biochar"][region][year] *
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            regional_coefficients["x"]["dac"][region][year] *
            x_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["dac"][region][year] *
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            regional_coefficients["x"]["renewableEnergy"][region][year] *
            x_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["renewableEnergy"][region][year] *
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    #################
    # Constraints
    ###############

    ## Constraint : Yearly budget timeline##

    Lp_prob += z_min >= 0.015 * (
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] * \
            regional_coefficients["x"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year] * \
            regional_coefficients["y"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["x"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["y"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] * \
            regional_coefficients["x"]["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["biochar"][region][year] * \
            regional_coefficients["y"]["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] * \
            regional_coefficients["x"]["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["dac"][region][year] * \
            regional_coefficients["y"]["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] * \
            regional_coefficients["x"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year] * \
            regional_coefficients["y"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    for year in range(26):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year] * regional_coefficients["x"]["nbsRemoval"][region][year] +
                y_vars["nbsRemoval"][region][year] * \
                regional_coefficients["y"]["nbsRemoval"][region][year]
                for region in regions
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year] * regional_coefficients["x"]["nbsAvoidance"][region][year] +
                y_vars["nbsAvoidance"][region][year] * \
                regional_coefficients["y"]["nbsAvoidance"][region][year]
                for region in regions
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year] * regional_coefficients["x"]["biochar"][region][year] +
                y_vars["biochar"][region][year] * \
                regional_coefficients["y"]["biochar"][region][year]
                for region in regions
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year] * regional_coefficients["x"]["dac"][region][year] +
                y_vars["dac"][region][year] * \
                regional_coefficients["y"]["dac"][region][year]
                for region in regions
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year] * regional_coefficients["x"]["renewableEnergy"][region][year] +
                y_vars["renewableEnergy"][region][year] * \
                regional_coefficients["y"]["renewableEnergy"][region][year]
                for region in regions
            ) >= z_min
        )

    ## Contraint : balanced upper bound of purchases per year##

    Lp_prob += z <= 0.08 * (
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] * \
            regional_coefficients["x"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year] * \
            regional_coefficients["y"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["x"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["y"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] * \
            regional_coefficients["x"]["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["biochar"][region][year] * \
            regional_coefficients["y"]["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] * \
            regional_coefficients["x"]["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["dac"][region][year] * \
            regional_coefficients["y"]["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] * \
            regional_coefficients["x"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year] * \
            regional_coefficients["y"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    for year in range(26):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year] * regional_coefficients["x"]["nbsRemoval"][region][year] +
                y_vars["nbsRemoval"][region][year] * \
                regional_coefficients["y"]["nbsRemoval"][region][year]
                for region in regions
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year] * regional_coefficients["x"]["nbsAvoidance"][region][year] +
                y_vars["nbsAvoidance"][region][year] * \
                regional_coefficients["y"]["nbsAvoidance"][region][year]
                for region in regions
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year] * regional_coefficients["x"]["biochar"][region][year] +
                y_vars["biochar"][region][year] * \
                regional_coefficients["y"]["biochar"][region][year]
                for region in regions
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year] * regional_coefficients["x"]["dac"][region][year] +
                y_vars["dac"][region][year] * \
                regional_coefficients["y"]["dac"][region][year]
                for region in regions
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year] * regional_coefficients["x"]["renewableEnergy"][region][year] +
                y_vars["renewableEnergy"][region][year] * \
                regional_coefficients["y"]["renewableEnergy"][region][year]
                for region in regions
            ) <= z
        )

    ## Constraint : On spot vs Forward##

    Lp_prob += (
        total_purch_for_on_spot_fwd ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    if not optimizeFinancing:
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year]
                for region in regions
                for year in range(26)
            )
            == financing["exPost"] * total_purch_for_on_spot_fwd
        )

        Lp_prob += (
            # NbS-ARR
            lpSum(
                y_vars["nbsRemoval"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # nbsAvoidance
            lpSum(
                y_vars["nbsAvoidance"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # biochar
            lpSum(
                y_vars["biochar"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # dac
            lpSum(
                y_vars["dac"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # renewableEnergy
            lpSum(
                y_vars["renewableEnergy"][region][year]
                for region in regions
                for year in range(26)
            )

            == financing["exAnte"] * total_purch_for_on_spot_fwd
        )

    ## Constraint : distribution of project typologies##

    Lp_prob += (
        total_purch_for_typo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    # NbS-ARR
    Lp_prob += (
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsRemoval"] * total_purch_for_typo_distrib
    )

    # nbsAvoidance
    Lp_prob += (
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsAvoidance"] * total_purch_for_typo_distrib
    )

    # dac
    Lp_prob += (
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["dac"] * total_purch_for_typo_distrib
    )

    # biochar
    Lp_prob += (
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["biochar"] * total_purch_for_typo_distrib
    )

    # renewableEnergy
    Lp_prob += (
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["renewableEnergy"] * total_purch_for_typo_distrib
    )

    ## Constraint : distribution of geographical areas##

    Lp_prob += (
        total_purch_for_geo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    # northAmerica
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["northAmerica"][year] +
            y_vars["nbsRemoval"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["northAmerica"][year] +
            y_vars["nbsAvoidance"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["northAmerica"][year] +
            y_vars["biochar"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["northAmerica"][year] +
            y_vars["dac"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["northAmerica"][year] +
            y_vars["renewableEnergy"]["northAmerica"][year]
            for year in range(26)
        )
    ) == region_allocation["northAmerica"] * total_purch_for_typo_distrib
    )

    # southAmerica
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["southAmerica"][year] +
            y_vars["nbsRemoval"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["southAmerica"][year] +
            y_vars["nbsAvoidance"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["southAmerica"][year] +
            y_vars["biochar"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["southAmerica"][year] +
            y_vars["dac"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["southAmerica"][year] +
            y_vars["renewableEnergy"]["southAmerica"][year]
            for year in range(26)
        )
    ) == region_allocation["southAmerica"] * total_purch_for_typo_distrib
    )

    # europe
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["europe"][year] +
            y_vars["nbsRemoval"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["europe"][year] +
            y_vars["nbsAvoidance"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["europe"][year] +
            y_vars["biochar"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["europe"][year] +
            y_vars["dac"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["europe"][year] +
            y_vars["renewableEnergy"]["europe"][year]
            for year in range(26)
        )
    ) == region_allocation["europe"] * total_purch_for_typo_distrib
    )

    # africa
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["africa"][year] +
            y_vars["nbsRemoval"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["africa"][year] +
            y_vars["nbsAvoidance"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["africa"][year] +
            y_vars["biochar"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["africa"][year] +
            y_vars["dac"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["africa"][year] +
            y_vars["renewableEnergy"]["africa"][year]
            for year in range(26)
        )
    ) == region_allocation["africa"] * total_purch_for_typo_distrib
    )

    # asia
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["asia"][year] +
            y_vars["nbsRemoval"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["asia"][year] +
            y_vars["nbsAvoidance"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["asia"][year] +
            y_vars["biochar"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["asia"][year] +
            y_vars["dac"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["asia"][year] +
            y_vars["renewableEnergy"]["asia"][year]
            for year in range(26)
        )
    ) == region_allocation["asia"] * total_purch_for_typo_distrib
    )

    # oceania
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["oceania"][year] +
            y_vars["nbsRemoval"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["oceania"][year] +
            y_vars["nbsAvoidance"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["oceania"][year] +
            y_vars["biochar"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["oceania"][year] +
            y_vars["dac"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["oceania"][year] +
            y_vars["renewableEnergy"]["oceania"][year]
            for year in range(26)
        )
    ) == region_allocation["oceania"] * total_purch_for_typo_distrib
    )

    ## Constraint : carbon units needs by years##

    for year, need in carbon_needs.items():
        year = int(year)
        year_index = year - 2025
        start_index = 25 - year_index

        Lp_prob += (
            lpSum(
                x_vars["nbsRemoval"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["nbsAvoidance"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["dac"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["renewableEnergy"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +


            lpSum(
                coefficients["nbsRemoval"][start_index:][t] *
                y_vars["nbsRemoval"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["nbsAvoidance"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["dac"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["renewableEnergy"][region][t]
                for region in regions
                for t in range(year_index + 1)
            )
        ) >= need

    #################
    # Solving
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
                        "price": regional_coefficients["x"][project][region][i],
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
                        "price": regional_coefficients["y"][project][region][i],
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
    carbon_needs: Dict[int, int],
    optimizeFinancing: bool
):
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
            "renewableEnergy": 0.05
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
    # Variables
    ##################

    # Geographic Regions
    regions = ["northAmerica", "southAmerica",
               "europe", "africa", "asia", "oceania"]

    # Project typologies and their code
    projects = {
        "nbsRemoval": 1,
        "nbsAvoidance": 2,
        "dac": 3,
        "biochar": 4,
        "renewableEnergy": 5
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
    z_min = p.LpVariable("z_min", lowBound=0)

    # total_purch_for_on_spot_fwd : total purchases variable 'on spot vs forward' constraint
    total_purch_for_on_spot_fwd = p.LpVariable(
        "total_purch_for_on_spot_fwd", lowBound=0)

    # total_purch_for_typo_distrib : total purchases variable used for the typologies distribution
    total_purch_for_typo_distrib = p.LpVariable(
        "total_purch_for_typo_distrib", lowBound=0)

    # total_purch_for_geo_distrib : total purchases variable used for geographical areas distribution
    total_purch_for_geo_distrib = p.LpVariable(
        "total_purch_for_geo_distrib", lowBound=0)

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
    # Objective function
    ######################

    # Coefficients per year (to be multiplied by regional factors)
    x_coefficients = {
        "nbsRemoval": [35.158035, 39.87520398, 45.22527759, 49.6880738, 54.59125536, 59.97827917],
        "nbsAvoidance": [23.76730151, 26.62919538, 29.8356987, 32.61933498, 35.66268132, 38.98996836],
        "dac": [618.970254, 449.4526759, 326.3609302, 305.6918961, 286.3318696, 268.197949],
        "biochar": [135.7778991, 111.5772177, 91.6899995, 82.66928321, 74.53604998, 67.20298678],
        "renewableEnergy": [108.68, 90.01, 74.55, 65.85, 58.17, 51.39]
    }

    # Generation of coefficients by region, project, and year
    regional_coefficients = {
        "x": {},
        "y": {}
    }

    for project, base_coefficients in x_coefficients.items():
        # Obtenir les facteurs régionaux pour le projet
        project_region_factors = regional_factors[project]
        regional_coefficients["x"][project] = {
            region: [c * factor for c in base_coefficients]
            for region, factor in project_region_factors.items()
        }
        regional_coefficients["y"][project] = {
            region: [c * 0.87 for c in regional_coefficients["x"][project][region]]
            for region in regional_coefficients["x"][project]
        }

    # Objective function
    Lp_prob += (
        # NbS-ARR
        lpSum(
            regional_coefficients["x"]["nbsRemoval"][region][year] *
            x_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["nbsRemoval"][region][year] *
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # nbsAvoidance
        lpSum(
            regional_coefficients["x"]["nbsAvoidance"][region][year] *
            x_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["nbsAvoidance"][region][year] *
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # biochar
        lpSum(
            regional_coefficients["x"]["biochar"][region][year] *
            x_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["biochar"][region][year] *
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # dac
        lpSum(
            regional_coefficients["x"]["dac"][region][year] *
            x_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["dac"][region][year] *
            y_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # renewableEnergy
        lpSum(
            regional_coefficients["x"]["renewableEnergy"][region][year] *
            x_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            regional_coefficients["y"]["renewableEnergy"][region][year] *
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        )
    )

    ###############################
    # Constraints
    ############################

    ## Constraint : 5 years budget timeline##

    Lp_prob += z_min >= 0.015 * (
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] * \
            regional_coefficients["x"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year] * \
            regional_coefficients["y"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["x"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["y"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] * \
            regional_coefficients["x"]["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["biochar"][region][year] * \
            regional_coefficients["y"]["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] * \
            regional_coefficients["x"]["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["dac"][region][year] * \
            regional_coefficients["y"]["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] * \
            regional_coefficients["x"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year] * \
            regional_coefficients["y"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        )
    )

    for year in range(6):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year] * regional_coefficients["x"]["nbsRemoval"][region][year] +
                y_vars["nbsRemoval"][region][year] * \
                regional_coefficients["y"]["nbsRemoval"][region][year]
                for region in regions
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year] * regional_coefficients["x"]["nbsAvoidance"][region][year] +
                y_vars["nbsAvoidance"][region][year] * \
                regional_coefficients["y"]["nbsAvoidance"][region][year]
                for region in regions
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year] * regional_coefficients["x"]["biochar"][region][year] +
                y_vars["biochar"][region][year] * \
                regional_coefficients["y"]["biochar"][region][year]
                for region in regions
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year] * regional_coefficients["x"]["dac"][region][year] +
                y_vars["dac"][region][year] * \
                regional_coefficients["y"]["dac"][region][year]
                for region in regions
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year] * regional_coefficients["x"]["renewableEnergy"][region][year] +
                y_vars["renewableEnergy"][region][year] * \
                regional_coefficients["y"]["renewableEnergy"][region][year]
                for region in regions
            ) >= z_min
        )

    # Contraint : balanced upper bound of purchases per year

    Lp_prob += z <= 0.25 * (
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] * \
            regional_coefficients["x"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year] * \
            regional_coefficients["y"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["x"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["y"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] * \
            regional_coefficients["x"]["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["biochar"][region][year] * \
            regional_coefficients["y"]["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] * \
            regional_coefficients["x"]["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["dac"][region][year] * \
            regional_coefficients["y"]["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] * \
            regional_coefficients["x"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year] * \
            regional_coefficients["y"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        )
    )

    for year in range(6):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year] * regional_coefficients["x"]["nbsRemoval"][region][year] +
                y_vars["nbsRemoval"][region][year] * \
                regional_coefficients["y"]["nbsRemoval"][region][year]
                for region in regions
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year] * regional_coefficients["x"]["nbsAvoidance"][region][year] +
                y_vars["nbsAvoidance"][region][year] * \
                regional_coefficients["y"]["nbsAvoidance"][region][year]
                for region in regions
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year] * regional_coefficients["x"]["biochar"][region][year] +
                y_vars["biochar"][region][year] * \
                regional_coefficients["y"]["biochar"][region][year]
                for region in regions
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year] * regional_coefficients["x"]["dac"][region][year] +
                y_vars["dac"][region][year] * \
                regional_coefficients["y"]["dac"][region][year]
                for region in regions
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year] * regional_coefficients["x"]["renewableEnergy"][region][year] +
                y_vars["renewableEnergy"][region][year] * \
                regional_coefficients["y"]["renewableEnergy"][region][year]
                for region in regions
            ) <= z
        )

    # Constraint : On spot vs Forward

    Lp_prob += (
        total_purch_for_on_spot_fwd ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        )
    )

    if not optimizeFinancing:
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year]
                for region in regions
                for year in range(6)
            )
            == financing["exPost"] * total_purch_for_on_spot_fwd
        )

        Lp_prob += (
            # NbS-ARR
            lpSum(
                y_vars["nbsRemoval"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # nbsAvoidance
            lpSum(
                y_vars["nbsAvoidance"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # biochar
            lpSum(
                y_vars["biochar"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # dac
            lpSum(
                y_vars["dac"][region][year]
                for region in regions
                for year in range(6)
            ) +

            # renewableEnergy
            lpSum(
                y_vars["renewableEnergy"][region][year]
                for region in regions
                for year in range(6)
            )

            == financing["exAnte"] * total_purch_for_on_spot_fwd
        )

    # Constraint : distribution of project typologies

    Lp_prob += (
        total_purch_for_typo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        )
    )

    # NbS-ARR
    Lp_prob += (
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["nbsRemoval"] * total_purch_for_typo_distrib
    )

    # nbsAvoidance
    Lp_prob += (
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["nbsAvoidance"] * total_purch_for_typo_distrib
    )

    # dac
    Lp_prob += (
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["dac"] * total_purch_for_typo_distrib
    )

    # biochar
    Lp_prob += (
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["biochar"] * total_purch_for_typo_distrib
    )

    # renewableEnergy
    Lp_prob += (
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        ) == typology["renewableEnergy"] * total_purch_for_typo_distrib
    )

    # Constraint : distribution of geographical areas

    Lp_prob += (
        total_purch_for_geo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(6)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(6)
        )
    )

    # northAmerica
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["northAmerica"][year] +
            y_vars["nbsRemoval"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["northAmerica"][year] +
            y_vars["nbsAvoidance"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["biochar"]["northAmerica"][year] +
            y_vars["biochar"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["dac"]["northAmerica"][year] +
            y_vars["dac"]["northAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["northAmerica"][year] +
            y_vars["renewableEnergy"]["northAmerica"][year]
            for year in range(6)
        )
    ) == region_allocation["northAmerica"] * total_purch_for_typo_distrib
    )

    # southAmerica
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["southAmerica"][year] +
            y_vars["nbsRemoval"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["southAmerica"][year] +
            y_vars["nbsAvoidance"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["biochar"]["southAmerica"][year] +
            y_vars["biochar"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["dac"]["southAmerica"][year] +
            y_vars["dac"]["southAmerica"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["southAmerica"][year] +
            y_vars["renewableEnergy"]["southAmerica"][year]
            for year in range(6)
        )
    ) == region_allocation["southAmerica"] * total_purch_for_typo_distrib
    )

    # europe
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["europe"][year] +
            y_vars["nbsRemoval"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["europe"][year] +
            y_vars["nbsAvoidance"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["biochar"]["europe"][year] +
            y_vars["biochar"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["dac"]["europe"][year] +
            y_vars["dac"]["europe"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["europe"][year] +
            y_vars["renewableEnergy"]["europe"][year]
            for year in range(6)
        )
    ) == region_allocation["europe"] * total_purch_for_typo_distrib
    )

    # africa
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["africa"][year] +
            y_vars["nbsRemoval"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["africa"][year] +
            y_vars["nbsAvoidance"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["biochar"]["africa"][year] +
            y_vars["biochar"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["dac"]["africa"][year] +
            y_vars["dac"]["africa"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["africa"][year] +
            y_vars["renewableEnergy"]["africa"][year]
            for year in range(6)
        )
    ) == region_allocation["africa"] * total_purch_for_typo_distrib
    )

    # asia
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["asia"][year] +
            y_vars["nbsRemoval"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["asia"][year] +
            y_vars["nbsAvoidance"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["biochar"]["asia"][year] +
            y_vars["biochar"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["dac"]["asia"][year] +
            y_vars["dac"]["asia"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["asia"][year] +
            y_vars["renewableEnergy"]["asia"][year]
            for year in range(6)
        )
    ) == region_allocation["asia"] * total_purch_for_typo_distrib
    )

    # oceania
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["oceania"][year] +
            y_vars["nbsRemoval"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["oceania"][year] +
            y_vars["nbsAvoidance"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["biochar"]["oceania"][year] +
            y_vars["biochar"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["dac"]["oceania"][year] +
            y_vars["dac"]["oceania"][year]
            for year in range(6)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["oceania"][year] +
            y_vars["renewableEnergy"]["oceania"][year]
            for year in range(6)
        )
    ) == region_allocation["oceania"] * total_purch_for_typo_distrib
    )

    # Definition of exAnte coefficients for each category
    coefficients = {

        "nbsRemoval": [0.99592, 0.97068, 0.81757, 0.07585, 0.01098, 0],

        "other_types": [1, 0.834, 0.667, 0.334, 0.167, 0],
    }

    for year, need in carbon_needs.items():
        year = int(year)
        year_index = (year - 2025)//5
        start_index = 5 - year_index

        Lp_prob += (

            lpSum(
                x_vars["nbsRemoval"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["nbsAvoidance"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["dac"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["renewableEnergy"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +


            lpSum(
                coefficients["nbsRemoval"][start_index:][t] *
                y_vars["nbsRemoval"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["nbsAvoidance"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["dac"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["renewableEnergy"][region][t]
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
                        "price": regional_coefficients["x"][project][region][i],
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
                        "price": regional_coefficients["y"][project][region][i],
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
    carbon_needs: Dict[int, int],
    optimizeFinancing: bool
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
            "renewableEnergy": 0.05
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
    # variables
    #############

    # Geographic Regions
    regions = ["northAmerica", "southAmerica",
               "europe", "africa", "asia", "oceania"]

    # Project typologies and their code
    projects = {
        "nbsRemoval": 1,
        "nbsAvoidance": 2,
        "dac": 3,
        "biochar": 4,
        "renewableEnergy": 5
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
    total_purch_for_on_spot_fwd = p.LpVariable(
        "total_purch_for_on_spot_fwd", lowBound=0)

    # total_purch_for_typo_distrib : total purchases variable used for the typologies distribution
    total_purch_for_typo_distrib = p.LpVariable(
        "total_purch_for_typo_distrib", lowBound=0)

    # total_purch_for_geo_distrib : total purchases variable used for geographical areas distribution
    total_purch_for_geo_distrib = p.LpVariable(
        "total_purch_for_geo_distrib", lowBound=0)

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
    # Objective function
    #################

    # Generation of coefficients by region, project, and year
    regional_coefficients = {
        "x": {},
        "y": {}
    }

    for project, base_coefficients in x_coefficients.items():
        # Obtenir les facteurs régionaux pour le projet
        project_region_factors = regional_factors[project]
        regional_coefficients["x"][project] = {
            region: [c * factor for c in base_coefficients]
            for region, factor in project_region_factors.items()
        }
        regional_coefficients["y"][project] = {
            region: [c * 0.87 for c in regional_coefficients["x"][project][region]]
            for region in regional_coefficients["x"][project]
        }

    # Objective function
    Lp_prob += (
        # NbS-ARR
        lpSum(
            regional_coefficients["x"]["nbsRemoval"][region][year] *
            x_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["nbsRemoval"][region][year] *
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            regional_coefficients["x"]["nbsAvoidance"][region][year] *
            x_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["nbsAvoidance"][region][year] *
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            regional_coefficients["x"]["biochar"][region][year] *
            x_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["biochar"][region][year] *
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            regional_coefficients["x"]["dac"][region][year] *
            x_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["dac"][region][year] *
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            regional_coefficients["x"]["renewableEnergy"][region][year] *
            x_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            regional_coefficients["y"]["renewableEnergy"][region][year] *
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    #################
    # Constraints
    ###############

    ## Contraint : balanced upper bound of purchases per year##

    Lp_prob += z <= 0.33 * (
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] * \
            regional_coefficients["x"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year] * \
            regional_coefficients["y"]["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["x"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year] * \
            regional_coefficients["y"]["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] * \
            regional_coefficients["x"]["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["biochar"][region][year] * \
            regional_coefficients["y"]["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] * \
            regional_coefficients["x"]["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["dac"][region][year] * \
            regional_coefficients["y"]["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] * \
            regional_coefficients["x"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year] * \
            regional_coefficients["y"]["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    for year in range(26):
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year] * regional_coefficients["x"]["nbsRemoval"][region][year] +
                y_vars["nbsRemoval"][region][year] * \
                regional_coefficients["y"]["nbsRemoval"][region][year]
                for region in regions
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year] * regional_coefficients["x"]["nbsAvoidance"][region][year] +
                y_vars["nbsAvoidance"][region][year] * \
                regional_coefficients["y"]["nbsAvoidance"][region][year]
                for region in regions
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year] * regional_coefficients["x"]["biochar"][region][year] +
                y_vars["biochar"][region][year] * \
                regional_coefficients["y"]["biochar"][region][year]
                for region in regions
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year] * regional_coefficients["x"]["dac"][region][year] +
                y_vars["dac"][region][year] * \
                regional_coefficients["y"]["dac"][region][year]
                for region in regions
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year] * regional_coefficients["x"]["renewableEnergy"][region][year] +
                y_vars["renewableEnergy"][region][year] * \
                regional_coefficients["y"]["renewableEnergy"][region][year]
                for region in regions
            ) <= z
        )

    ## Constraint : On spot vs Forward##

    Lp_prob += (
        total_purch_for_on_spot_fwd ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) +
        lpSum(
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )
    if not optimizeFinancing:
        Lp_prob += (
            # NbS-ARR
            lpSum(
                x_vars["nbsRemoval"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # nbsAvoidance
            lpSum(
                x_vars["nbsAvoidance"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # biochar
            lpSum(
                x_vars["biochar"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # dac
            lpSum(
                x_vars["dac"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # renewableEnergy
            lpSum(
                x_vars["renewableEnergy"][region][year]
                for region in regions
                for year in range(26)
            )
            == financing["exPost"] * total_purch_for_on_spot_fwd
        )

        Lp_prob += (
            # NbS-ARR
            lpSum(
                y_vars["nbsRemoval"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # nbsAvoidance
            lpSum(
                y_vars["nbsAvoidance"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # biochar
            lpSum(
                y_vars["biochar"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # dac
            lpSum(
                y_vars["dac"][region][year]
                for region in regions
                for year in range(26)
            ) +

            # renewableEnergy
            lpSum(
                y_vars["renewableEnergy"][region][year]
                for region in regions
                for year in range(26)
            )

            == financing["exAnte"] * total_purch_for_on_spot_fwd
        )

    ## Constraint : distribution of project typologies##

    Lp_prob += (
        total_purch_for_typo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    # NbS-ARR
    Lp_prob += (
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsRemoval"] * total_purch_for_typo_distrib
    )

    # nbsAvoidance
    Lp_prob += (
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["nbsAvoidance"] * total_purch_for_typo_distrib
    )

    # dac
    Lp_prob += (
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["dac"] * total_purch_for_typo_distrib
    )

    # biochar
    Lp_prob += (
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["biochar"] * total_purch_for_typo_distrib
    )

    # renewableEnergy
    Lp_prob += (
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        ) == typology["renewableEnergy"] * total_purch_for_typo_distrib
    )

    ## Constraint : distribution of geographical areas##

    Lp_prob += (
        total_purch_for_geo_distrib ==
        # NbS-ARR
        lpSum(
            x_vars["nbsRemoval"][region][year] +
            y_vars["nbsRemoval"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # nbsAvoidance
        lpSum(
            x_vars["nbsAvoidance"][region][year] +
            y_vars["nbsAvoidance"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # biochar
        lpSum(
            x_vars["biochar"][region][year] +
            y_vars["biochar"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # dac
        lpSum(
            x_vars["dac"][region][year] +
            y_vars["dac"][region][year]
            for region in regions
            for year in range(26)
        ) +

        # renewableEnergy
        lpSum(
            x_vars["renewableEnergy"][region][year] +
            y_vars["renewableEnergy"][region][year]
            for region in regions
            for year in range(26)
        )
    )

    # northAmerica
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["northAmerica"][year] +
            y_vars["nbsRemoval"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["northAmerica"][year] +
            y_vars["nbsAvoidance"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["northAmerica"][year] +
            y_vars["biochar"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["northAmerica"][year] +
            y_vars["dac"]["northAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["northAmerica"][year] +
            y_vars["renewableEnergy"]["northAmerica"][year]
            for year in range(26)
        )
    ) == region_allocation["northAmerica"] * total_purch_for_typo_distrib
    )

    # southAmerica
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["southAmerica"][year] +
            y_vars["nbsRemoval"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["southAmerica"][year] +
            y_vars["nbsAvoidance"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["southAmerica"][year] +
            y_vars["biochar"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["southAmerica"][year] +
            y_vars["dac"]["southAmerica"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["southAmerica"][year] +
            y_vars["renewableEnergy"]["southAmerica"][year]
            for year in range(26)
        )
    ) == region_allocation["southAmerica"] * total_purch_for_typo_distrib
    )

    # europe
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["europe"][year] +
            y_vars["nbsRemoval"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["europe"][year] +
            y_vars["nbsAvoidance"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["europe"][year] +
            y_vars["biochar"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["europe"][year] +
            y_vars["dac"]["europe"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["europe"][year] +
            y_vars["renewableEnergy"]["europe"][year]
            for year in range(26)
        )
    ) == region_allocation["europe"] * total_purch_for_typo_distrib
    )

    # africa
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["africa"][year] +
            y_vars["nbsRemoval"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["africa"][year] +
            y_vars["nbsAvoidance"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["africa"][year] +
            y_vars["biochar"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["africa"][year] +
            y_vars["dac"]["africa"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["africa"][year] +
            y_vars["renewableEnergy"]["africa"][year]
            for year in range(26)
        )
    ) == region_allocation["africa"] * total_purch_for_typo_distrib
    )

    # asia
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["asia"][year] +
            y_vars["nbsRemoval"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["asia"][year] +
            y_vars["nbsAvoidance"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["asia"][year] +
            y_vars["biochar"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["asia"][year] +
            y_vars["dac"]["asia"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["asia"][year] +
            y_vars["renewableEnergy"]["asia"][year]
            for year in range(26)
        )
    ) == region_allocation["asia"] * total_purch_for_typo_distrib
    )

    # oceania
    Lp_prob += ((
        lpSum(
            x_vars["nbsRemoval"]["oceania"][year] +
            y_vars["nbsRemoval"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["nbsAvoidance"]["oceania"][year] +
            y_vars["nbsAvoidance"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["biochar"]["oceania"][year] +
            y_vars["biochar"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["dac"]["oceania"][year] +
            y_vars["dac"]["oceania"][year]
            for year in range(26)
        ) +
        lpSum(
            x_vars["renewableEnergy"]["oceania"][year] +
            y_vars["renewableEnergy"]["oceania"][year]
            for year in range(26)
        )
    ) == region_allocation["oceania"] * total_purch_for_typo_distrib
    )

    ## Constraint : carbon units needs by years##

    for year, need in carbon_needs.items():
        year = int(year)
        year_index = year - 2025
        start_index = 25 - year_index

        Lp_prob += (

            lpSum(
                x_vars["nbsRemoval"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["nbsAvoidance"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["dac"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                x_vars["renewableEnergy"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +


            lpSum(
                coefficients["nbsRemoval"][start_index:][t] *
                y_vars["nbsRemoval"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["nbsAvoidance"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["dac"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["biochar"][region][t]
                for region in regions
                for t in range(year_index + 1)
            ) +
            lpSum(
                coefficients["other_types"][start_index:][t] *
                y_vars["renewableEnergy"][region][t]
                for region in regions
                for t in range(year_index + 1)
            )
        ) >= need

    #################
    # Solving
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
                        "price": regional_coefficients["x"][project][region][i],
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
                        "price": regional_coefficients["y"][project][region][i],
                        "type": "ex-ante"
                    })

    return {
        "results": results,
        "total_price": Lp_prob.objective.value()
    }
