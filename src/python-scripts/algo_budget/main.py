import json
import sys

from algorithms import yearlyAlgo, fiveYearAlgo, flexibleAlgo
from models import Financing, Typology, RegionAllocation, TimeConstraint

def main():
    input_json = json.loads(sys.argv[1])

    financing = input_json.get("financing", {})
    typology = input_json.get("typology", {})
    region_allocation = input_json.get("regionAllocation", {})
    carbon_needs = input_json.get("carbonNeeds", {})
    time_constraint = input_json.get("timeConstraint", "Yearly")

    if not financing or not typology or not region_allocation or not carbon_needs:
        print("Error: missing data.")
        sys.exit(1)

    if time_constraint == "Yearly":
        result = yearlyAlgo(financing, typology, region_allocation, carbon_needs)
    elif time_constraint == "FiveYear":
        result = fiveYearAlgo(financing, typology, region_allocation, carbon_needs)
    else:
        result = flexibleAlgo(financing, typology, region_allocation, carbon_needs)

    print(json.dumps(result))

if __name__ == "__main__":
    main()
