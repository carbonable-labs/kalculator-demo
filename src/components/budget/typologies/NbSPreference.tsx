import SelectComponent from "@/components/form/Select";
import { TYPOLOGY_PREFERENCE } from "@/utils/configuration";

interface NbSPreferenceProps {
  setNbSPreference: (value: string) => void;
}

export default function NbSPreference({ setNbSPreference }: NbSPreferenceProps) {
  return (
    <SelectComponent
      question='Do you prefer avoidance or removal?'
      isRequired={true}
      label='Select your preference'
      options={[
        { key: TYPOLOGY_PREFERENCE.NBS_AVOIDANCE, value: 'Avoidance' },
        { key: TYPOLOGY_PREFERENCE.NBS_REMOVAL, value: 'Removal' },
        { key: TYPOLOGY_PREFERENCE.NO_IDEA, value: 'No idea' },
      ]}
      onChange={setNbSPreference}
    />
  );
}