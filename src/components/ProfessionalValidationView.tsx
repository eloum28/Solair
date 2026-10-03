import React, { useState, useMemo } from 'react';
import { EquipmentSelectionCards } from './EquipmentSelectionCards';
import { ValidationMatrixTable } from './ValidationMatrixTable';
import { StringAssignmentTool } from './StringAssignmentTool';
import { DcBusAnalysisCard } from './DcBusAnalysisCard';
import { ValidationScorecard } from './ValidationScorecard';
import { CustomEquipmentModal } from './CustomEquipmentModal';

import { Project, CalculationResults } from '../types/solar';
import { EquipmentCategory, SolarPanel, Battery, Inverter, MPPTController } from '../types/equipment';
import { 
  getPanelById, 
  getBatteryById, 
  getInverterById, 
  getMpptById 
} from '../lib/equipmentDatabase';
import { validateProfessionalSystem } from '../lib/equipmentValidation';
import { Translations } from '../lib/translations';

interface ProfessionalValidationViewProps {
  project: Project;
  results: CalculationResults;
  onUpdateProject: (updates: Partial<Project>) => void;
  t: Translations;
  isDark: boolean;
}

export const ProfessionalValidationView: React.FC<ProfessionalValidationViewProps> = ({
  project,
  results,
  onUpdateProject,
  t,
  isDark,
}) => {
  const [customModalCategory, setCustomModalCategory] = useState<EquipmentCategory | null>(null);

  // Selected hardware objects
  const selectedPanel = useMemo(() => {
    return getPanelById(project.selectedPanelId, project.customPanels) || getPanelById();
  }, [project.selectedPanelId, project.customPanels])!;

  const selectedBattery = useMemo(() => {
    return getBatteryById(project.selectedBatteryId, project.customBatteries) || getBatteryById();
  }, [project.selectedBatteryId, project.customBatteries])!;

  const selectedInverter = useMemo(() => {
    return getInverterById(project.selectedInverterId, project.customInverters) || getInverterById();
  }, [project.selectedInverterId, project.customInverters])!;

  const selectedMppt = useMemo(() => {
    return getMpptById(project.selectedMpptId, project.customMppts) || getMpptById();
  }, [project.selectedMpptId, project.customMppts])!;

  // String assignments state
  const stringAssignments = project.stringAssignments;

  // Run Professional Validation Engine
  const validationResult = useMemo(() => {
    return validateProfessionalSystem(
      results,
      selectedPanel,
      selectedBattery,
      selectedInverter,
      selectedMppt,
      project.location,
      project.stringDesign,
      stringAssignments
    );
  }, [
    results,
    selectedPanel,
    selectedBattery,
    selectedInverter,
    selectedMppt,
    project.location,
    project.stringDesign,
    stringAssignments,
  ]);

  // Handlers for equipment selection
  const handleSelectPanel = (panelId: string) => {
    const p = getPanelById(panelId, project.customPanels);
    if (!p) return;
    onUpdateProject({
      selectedPanelId: panelId,
      solar: {
        ...project.solar,
        panelWattage: p.ratedPowerW,
      },
      stringDesign: {
        ...project.stringDesign,
        panelVoc: p.voc,
        panelVmp: p.vmp,
        panelIsc: p.isc,
        panelImp: p.imp,
        panelWatts: p.ratedPowerW,
        tempCoeffVoc: p.tempCoeffVoc,
        hasSpecs: true,
      },
    });
  };

  const handleSelectBattery = (batteryId: string) => {
    const b = getBatteryById(batteryId, project.customBatteries);
    if (!b) return;
    onUpdateProject({
      selectedBatteryId: batteryId,
      battery: {
        ...project.battery,
        modelName: `${b.manufacturer} ${b.model}`,
        chemistry: b.chemistry,
        unitVoltage: b.nominalVoltageV,
        unitAh: b.nominalAh,
        unitNominalKwh: b.nominalKwh,
        dodLimit: b.recommendedDodPercent / 100,
      },
    });
  };

  const handleSelectInverter = (inverterId: string) => {
    const inv = getInverterById(inverterId, project.customInverters);
    if (!inv) return;
    onUpdateProject({
      selectedInverterId: inverterId,
      inverter: {
        ...project.inverter,
        selectedSizeKw: inv.continuousOutputPowerKw,
        surgeRatingKw: inv.surgePowerKw,
        surgeDurationSec: inv.surgeDurationSec,
        efficiency: inv.efficiencyPercent / 100,
        isManufacturerVerified: inv.sourceStatus === 'DATASHEET_VERIFIED',
      },
    });
  };

  const handleSelectMppt = (mpptId: string) => {
    const m = getMpptById(mpptId, project.customMppts);
    if (!m) return;
    onUpdateProject({
      selectedMpptId: mpptId,
      mppt: {
        ...project.mppt,
        ratedCurrentA: m.maxChargingCurrentA,
        maxPvVoc: m.maxPvVoc,
        mpptVmin: m.mpptVoltageMinV,
        mpptVmax: m.mpptVoltageMaxV,
        maxInputCurrentA: m.maxPvInputCurrentA,
        isManufacturerVerified: m.sourceStatus === 'DATASHEET_VERIFIED',
      },
    });
  };

  // Custom equipment save handlers
  const handleSaveCustomPanel = (newPanel: SolarPanel) => {
    const updated = [...(project.customPanels || []), newPanel];
    onUpdateProject({
      customPanels: updated,
      selectedPanelId: newPanel.id,
      solar: { ...project.solar, panelWattage: newPanel.ratedPowerW },
      stringDesign: {
        ...project.stringDesign,
        panelVoc: newPanel.voc,
        panelVmp: newPanel.vmp,
        panelIsc: newPanel.isc,
        panelImp: newPanel.imp,
        panelWatts: newPanel.ratedPowerW,
        tempCoeffVoc: newPanel.tempCoeffVoc,
        hasSpecs: true,
      },
    });
  };

  const handleSaveCustomBattery = (newBattery: Battery) => {
    const updated = [...(project.customBatteries || []), newBattery];
    onUpdateProject({
      customBatteries: updated,
      selectedBatteryId: newBattery.id,
      battery: {
        ...project.battery,
        modelName: `${newBattery.manufacturer} ${newBattery.model}`,
        chemistry: newBattery.chemistry,
        unitVoltage: newBattery.nominalVoltageV,
        unitAh: newBattery.nominalAh,
        unitNominalKwh: newBattery.nominalKwh,
        dodLimit: newBattery.recommendedDodPercent / 100,
      },
    });
  };

  const handleSaveCustomInverter = (newInverter: Inverter) => {
    const updated = [...(project.customInverters || []), newInverter];
    onUpdateProject({
      customInverters: updated,
      selectedInverterId: newInverter.id,
      inverter: {
        ...project.inverter,
        selectedSizeKw: newInverter.continuousOutputPowerKw,
        surgeRatingKw: newInverter.surgePowerKw,
        surgeDurationSec: newInverter.surgeDurationSec,
        efficiency: newInverter.efficiencyPercent / 100,
        isManufacturerVerified: newInverter.sourceStatus === 'DATASHEET_VERIFIED',
      },
    });
  };

  const handleSaveCustomMppt = (newMppt: MPPTController) => {
    const updated = [...(project.customMppts || []), newMppt];
    onUpdateProject({
      customMppts: updated,
      selectedMpptId: newMppt.id,
      mppt: {
        ...project.mppt,
        ratedCurrentA: newMppt.maxChargingCurrentA,
        maxPvVoc: newMppt.maxPvVoc,
        mpptVmin: newMppt.mpptVoltageMinV,
        mpptVmax: newMppt.mpptVoltageMaxV,
        maxInputCurrentA: newMppt.maxPvInputCurrentA,
        isManufacturerVerified: newMppt.sourceStatus === 'DATASHEET_VERIFIED',
      },
    });
  };

  const handleUpdateStringAssignment = (stringIndex: number, mpptIndex: number, trackerIndex: number) => {
    const current = project.stringAssignments || [];
    const filtered = current.filter((c) => c.stringIndex !== stringIndex);
    const updated = [...filtered, { stringIndex, mpptIndex, trackerIndex }];
    onUpdateProject({ stringAssignments: updated });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Equipment Selection Cards */}
      <EquipmentSelectionCards
        panel={selectedPanel}
        battery={selectedBattery}
        inverter={selectedInverter}
        mppt={selectedMppt}
        onSelectPanelId={handleSelectPanel}
        onSelectBatteryId={handleSelectBattery}
        onSelectInverterId={handleSelectInverter}
        onSelectMpptId={handleSelectMppt}
        onOpenCustomModal={(cat) => setCustomModalCategory(cat)}
        customPanels={project.customPanels}
        customBatteries={project.customBatteries}
        customInverters={project.customInverters}
        customMppts={project.customMppts}
        results={results}
      />

      {/* 2. Validation Scorecard & Compatibility Engine */}
      <ValidationScorecard
        scorecard={validationResult.scorecard}
        systemValidationLevel={validationResult.systemValidationLevel}
        compatibilityWarnings={validationResult.compatibilityWarnings}
        unverifiedItems={validationResult.unverifiedItems}
      />

      {/* 3. Validation Matrix Table */}
      <ValidationMatrixTable
        matrix={validationResult.matrix}
      />

      {/* 4. DC Bus Analysis Card */}
      <DcBusAnalysisCard
        busAnalysis={validationResult.busAnalysis}
        battery={selectedBattery}
        inverter={selectedInverter}
        results={results}
      />

      {/* 5. String Allocation Tool */}
      <StringAssignmentTool
        allocations={validationResult.stringAllocations}
        trackers={validationResult.trackerValidations}
        panel={selectedPanel}
        inverter={selectedInverter}
        mppt={selectedMppt}
        results={results}
        location={project.location}
        onUpdateStringAssignment={handleUpdateStringAssignment}
      />

      {/* Custom Equipment Editor Modal */}
      {customModalCategory && (
        <CustomEquipmentModal
          isOpen={Boolean(customModalCategory)}
          onClose={() => setCustomModalCategory(null)}
          category={customModalCategory}
          onSavePanel={handleSaveCustomPanel}
          onSaveBattery={handleSaveCustomBattery}
          onSaveInverter={handleSaveCustomInverter}
          onSaveMppt={handleSaveCustomMppt}
        />
      )}

    </div>
  );
};
