nbsRemovalRegion = {
    "northAmerica": 2.16,
    "southAmerica": 0.37,
    "europe": 2.43,
    "africa": 0.73,
    "asia": 0.91,
    "oceania": 5.43,
}

nbsAvoidanceRegion = {
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

renewableEnergyRegion = {
    "northAmerica": 2.27,
    "southAmerica": 0.42,
    "europe": 0.99,
    "africa": 0.39,
    "asia": 0.38,
    "oceania": 1.64,
}

regional_factors = {
    "nbsRemoval": nbsRemovalRegion,
    "nbsAvoidance": nbsAvoidanceRegion,
    "dac": dacRegion,
    "biochar": biocharRegion,
    "renewableEnergy": renewableEnergyRegion
}

# Coefficients per year (to be multiplied by regional factors), from 2025 to 2050
x_coefficients = {
    "nbsRemoval": [35.158035, 36.0545649, 36.9739563, 37.91679219, 38.88367039, 39.87520398,
                40.89202168, 41.93476824, 43.00410483, 44.1007095, 45.22527759, 46.08455787,
                46.96016446, 47.85240759, 48.76160333, 49.6880738, 50.6321472, 51.594158,
                52.574447, 53.57336149, 54.59125536, 55.62848921, 56.68543051, 57.76245369,
                58.85994031, 59.97827917],
    "nbsAvoidance": [23.76730151, 24.31394944, 24.87317028, 25.4452532, 26.03049402, 26.62919538,
                 27.24166688, 27.86822521, 28.50919439, 29.16490586, 29.8356987, 30.37274128,
                 30.91945062, 31.47600073, 32.04256874, 32.61933498, 33.20648301, 33.8041997,
                 34.4126753, 35.03210345, 35.66268132, 36.30460958, 36.95809255, 37.62333822,
                 38.30055831, 38.98996836],
    "dac": [618.970254, 580.5940983, 544.5972642, 510.8322338, 479.1606353, 449.4526759,
            421.58661, 395.4482402, 370.9304493, 347.9327614, 326.3609302, 322.1182381,
            317.930701, 313.7976019, 309.7182331, 305.6918961, 301.7179014, 297.7955687,
            293.9242263, 290.1032114, 286.3318696, 282.6095553, 278.9356311, 275.3094679,
            271.7304448, 268.197949],
    "biochar": [135.7778991, 130.55045, 125.5242577, 120.6915738, 116.0449482, 111.5772177,
                107.2814948, 103.1511572, 99.17983769, 95.36141394, 91.6899995, 89.81035451,
                87.96924225, 86.16587278, 84.39947239, 82.66928321, 80.9745629, 79.31458436,
                77.68863538, 76.09601836, 74.53604998, 73.00806095, 71.5113957, 70.04541209,
                68.60948115, 67.20298678],
    "renewableEnergy": [108.68, 104.66, 100.79,  97.06,  93.47,  90.01,  86.68,  83.47,  80.39,
                    77.41,  74.55,  72.72,  70.94,  69.20,  67.51,  65.85,  64.24,  62.66,
                    61.13,  59.63,  58.17,  56.75,  55.36,  54.00,  52.68,  51.39]
}


# Definition of exAnte coefficients for each category modelizing the curve emission
coefficients = {
    "nbsRemoval": [0.99592, 0.99592, 0.99592, 0.97068, 0.97068, 0.97068, 0.97068,
                0.81757, 0.81757, 0.81757, 0.81757, 0.37754, 0.37754, 0.37754,
                0.37754, 0.07585, 0.07585, 0.07585, 0.07585, 0.01098, 0.01098,
                0.01098, 0.01098, 0, 0, 0],

    "other_types": [1, 1, 1, 0.834, 0.834, 0.834, 0.834, 0.667, 0.667, 0.667, 0.667,
                    0.5, 0.5, 0.5, 0.5, 0.334, 0.334, 0.334, 0.334, 0.167, 0.167,
                    0.167, 0.167, 0, 0, 0],
}
