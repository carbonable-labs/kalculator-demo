from enum import Enum
from typing import TypedDict

class Financing(TypedDict):
    exPost: int
    exAnte: int

class Typology(TypedDict):
    nbsRemoval: int
    nbsAvoidance: int
    biochar: int
    dac: int
    renewableEnergy: int

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
    Dynamic keys. Example :
    {2025: 5000, 2026: 6000}
    """
    pass

