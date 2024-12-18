export const tooltip = (
  <div>
    <div>
      <div className="font-bold">Investment Strategy Parameters</div>
      <div className="mt-2 text-tiny">
        <div>
          <span className="font-bold underline">Time Horizons:</span> Projects follow industry
          standards with a 4-year audit period and 25 years for forward financing credit delivery.
        </div>

        <div className="mt-2">
          <span className="font-bold underline">Credit Delivery Pattern:</span> NBS-Removal follows
          a sigmoid curve distribution, while other project types follow a linear distribution for
          forward financing.
        </div>

        <div className="mt-2">
          <span className="font-bold underline">Investment Scheduling:</span> Three available
          strategies:
          <ul className="ml-4 mt-1 list-disc">
            <li>Yearly: Requires minimum annual investment with upper bounds</li>
            <li>5-Year: Investment restricted to 5-year intervals with specific thresholds</li>
            <li>Flexible: Unrestricted timing with no threshold constraints</li>
          </ul>
        </div>

        <div className="mt-2">
          <span className="font-bold underline">Cost Considerations:</span> Forward financing
          typically offers cost advantages, though actual savings depend on specific project
          characteristics.
        </div>

        <div className="mt-2 italic text-gray-500">
          Note: Results are indicative and will require adjustment based on actual project metadata
          and characteristics.
        </div>
      </div>
    </div>
  </div>
);
