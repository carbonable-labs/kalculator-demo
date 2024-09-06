import SelectComponent from "@/components/form/Select";
import { TYPOLOGY_PREFERENCE } from "@/utils/configuaration";

interface ImpactPreferenceProps {
  setImpactPreference: (value: string) => void;
}

export default function ImpactPreference({ setImpactPreference }: ImpactPreferenceProps) {
  return (
    <SelectComponent
      question='Do you prefer climate Impact or biodiversity impact?'
      isRequired={true}
      label='Select your preference'
      options={[
        { key: TYPOLOGY_PREFERENCE.CLIMATE_IMPACT, value: 'Impact' },
        { key: TYPOLOGY_PREFERENCE.BIODIVERSITY_IMPACT, value: 'Biodiversity' },
      ]}
      onChange={setImpactPreference}
    />
  );
}