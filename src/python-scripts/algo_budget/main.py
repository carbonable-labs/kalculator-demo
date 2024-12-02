import json
import sys

from algorithms import yearlyAlgo, fiveYearAlgo, flexibleAlgo
from models import Financing, Typology, RegionAllocation, TimeConstraint

def main():
    input_json = json.loads(sys.argv[1])

    financing = input_json.get("financing", {})
    typology = input_json.get("typology", {})
    region_allocation = input_json.get("regionAllocation", {})
    carbon_needs = input_json.get("carbonUnitNeeds", {})
    time_constraint = input_json.get("timeConstraints", {})

    if not financing:
        print("Error: missing financing")
        sys.exit(1)
    if not typology:
        print("Error: missing typology")
        sys.exit(1)
    if not region_allocation:
        print("Error: missing region_allocation")
        sys.exit(1)
    if not carbon_needs:
        print("Error: missing carbon_needs")
        sys.exit(1)
    if not time_constraint:
        print("Error: missing time_constraint")
        sys.exit(1)        
    optimizeFinancing = False
    if float(financing["exPost"]) == 0.0 and float(financing["exAnte"]) == 0.0:
        optimizeFinancing = True
        

    if time_constraint == 1:
        result = yearlyAlgo(financing, typology, region_allocation, carbon_needs, optimizeFinancing)
    elif time_constraint == 5:
        result = fiveYearAlgo(financing, typology, region_allocation, carbon_needs, optimizeFinancing)
    else:
        result = flexibleAlgo(financing, typology, region_allocation, carbon_needs, optimizeFinancing)
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
