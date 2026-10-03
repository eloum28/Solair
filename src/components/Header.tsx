import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  FileText, 
  FolderOpen, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  ChevronDown, 
  Check,
  Zap,
  Sliders,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { Translations, SupportedLanguage } from '../lib/translations';
import { Project, AppDesignMode } from '../types/solar';

interface HeaderProps {
  t: Translations;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentProject: Project;
  savedProjects: Project[];
  activeMode: AppDesignMode;
  onSelectMode: (mode: AppDesignMode) => void;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onDuplicateProject: () => void;
  onRenameProject: (newName: string) => void;
  onDeleteProject: () => void;
  onExportProject: () => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenReport: () => void;
  saveNotice: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  currentLang,
  onLanguageChange,
  isDark,
  onToggleTheme,
  currentProject,
  savedProjects,
  activeMode,
  onSelectMode,
  onSelectProject,
  onNewProject,
  onSaveProject,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
  onOpenReport,
  saveNotice,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(currentProject.name);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNameInput(currentProject.name);
  }, [currentProject.name]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onRenameProject(nameInput.trim());
      setIsRenaming(false);
    }
  };

  // Reusable project dropdown content
  const renderProjectDropdown = () => (
    <div className="absolute left-0 mt-1.5 w-64 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 light:text-slate-700">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 light:text-slate-500 border-b border-slate-800 light:border-slate-100 flex items-center justify-between">
        <span>{t.saveProject} / Projects</span>
        {saveNotice && <span className="text-emerald-400 text-[10px] lowercase flex items-center gap-1"><Check className="w-2.5 h-2.5" /> saved</span>}
      </div>

      <button
        type="button"
        onClick={() => {
          onNewProject();
          setProjectMenuOpen(false);
        }}
        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#172646] light:hover:bg-slate-100 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{t.newProject}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onSaveProject();
          setProjectMenuOpen(false);
        }}
        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#172646] light:hover:bg-slate-100 transition-colors"
      >
        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>{t.saveProject}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onDuplicateProject();
          setProjectMenuOpen(false);
        }}
        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#172646] light:hover:bg-slate-100 transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>{t.duplicateProject}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setIsRenaming(true);
          setProjectMenuOpen(false);
        }}
        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#172646] light:hover:bg-slate-100 transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{t.renameProject}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onExportProject();
          setProjectMenuOpen(false);
        }}
        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#172646] light:hover:bg-slate-100 transition-colors"
      >
        <Download className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>{t.exportJson}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          fileInputRef.current?.click();
          setProjectMenuOpen(false);
        }}
        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#172646] light:hover:bg-slate-100 transition-colors"
      >
        <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>{t.importJson}</span>
      </button>

      {savedProjects.length > 1 && (
        <>
          <div className="border-t border-slate-800 light:border-slate-100 my-1" />
          <div className="px-3 py-1 text-[10px] font-semibold text-slate-400">
            Switch Project ({savedProjects.length})
          </div>
          <div className="max-h-36 overflow-y-auto">
            {savedProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelectProject(p.id);
                  setProjectMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left truncate flex items-center justify-between text-xs transition-colors ${
                  p.id === currentProject.id
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'hover:bg-[#172646] light:hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{p.name}</span>
                {p.id === currentProject.id && <Check className="w-3 h-3 text-emerald-400 ml-1 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 light:border-slate-100 my-1" />
          <button
            type="button"
            onClick={() => {
              onDeleteProject();
              setProjectMenuOpen(false);
            }}
            className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t.deleteProject}</span>
          </button>
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-[#0b1329]/95 light:bg-white/95 backdrop-blur-md border-b border-slate-800/80 light:border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors no-print">
      
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImportProject}
        accept=".json"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto">
        
        {/* DESKTOP TOP BAR (>= 1024px) */}
        <div className="hidden lg:flex items-center justify-between gap-3 xl:gap-4">
          
          {/* Left: Branding & Project */}
          <div className="flex items-center gap-3 xl:gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-lg shrink-0">
                ⚡
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white light:text-slate-900">
                  VoltPlan
                </span>
                <span className="hidden xl:inline-block ml-3 text-xs font-medium text-slate-400 light:text-slate-500 border-l border-slate-700 light:border-slate-300 pl-3">
                  {t.tagline}
                </span>
              </div>
            </div>

            {/* Desktop Project Selector */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#111e38] light:bg-slate-100 hover:bg-[#172646] light:hover:bg-slate-200 text-slate-200 light:text-slate-800 border border-slate-700/60 light:border-slate-300 rounded-lg transition-colors max-w-[200px] xl:max-w-xs truncate"
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{currentProject.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {projectMenuOpen && renderProjectDropdown()}
            </div>

            {saveNotice && (
              <span className="text-[11px] text-emerald-400 hidden xl:inline-flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" /> Autosaved
              </span>
            )}
          </div>

          {/* Center: 3 Design Modes */}
          <div className="flex items-center p-1 bg-[#111e38] light:bg-slate-100 border border-slate-700/60 light:border-slate-300 rounded-xl text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => onSelectMode('quick')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'quick'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
              }`}
              title="Simplified homeowner solar load & sizing interface"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>{t.quickDesign}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMode('engineering')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'engineering'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
              }`}
              title="Complete off-grid engineering design dashboard & 24h simulation"
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>{t.engineeringDesign}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMode('professional')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'professional'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
              }`}
              title="Equipment datasheet validation, DC bus analysis, string assignment & matrix"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{t.professionalValidation}</span>
            </button>
          </div>

          {/* Right: Language, Theme, Report */}
          <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center p-0.5 bg-[#111e38] light:bg-slate-100 border border-slate-700/60 light:border-slate-300 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  currentLang === 'en'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('fr')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  currentLang === 'fr'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
                }`}
              >
                FR
              </button>
            </div>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle dark/light theme"
              className="p-1.5 text-slate-300 light:text-slate-700 bg-[#111e38] light:bg-slate-100 border border-slate-700/60 light:border-slate-300 rounded-lg hover:text-white transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Report Button */}
            <button
              type="button"
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/10 rounded-lg transition-all"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{t.report}</span>
            </button>
          </div>

        </div>

        {/* MOBILE & TABLET LAYOUT (< 1024px) - Clean 2-Row Layout per Requirement 6 */}
        <div className="lg:hidden space-y-2">
          
          {/* ROW 1: VoltPlan logo + Active Mode Badge + Menu Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md text-slate-950 font-bold text-base shrink-0">
                ⚡
              </div>
              <span className="text-lg font-bold tracking-tight text-white light:text-slate-900 shrink-0">
                VoltPlan
              </span>
              
              {/* Active Mode Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shrink-0 ${
                activeMode === 'engineering'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : activeMode === 'quick'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
              }`}>
                {activeMode === 'engineering' ? 'ENGINEERING' : activeMode === 'quick' ? 'QUICK DESIGN' : 'VALIDATION'}
              </span>
            </div>

            {/* Hamburger / Menu Toggle (Min 42px Touch Target) */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation menu"
              className="min-h-[42px] px-3 flex items-center justify-center gap-1.5 text-slate-200 light:text-slate-800 bg-[#111e38] light:bg-slate-100 border border-slate-700/80 light:border-slate-300 rounded-xl hover:text-white transition-colors"
            >
              {mobileNavOpen ? (
                <>
                  <X className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-semibold">Close</span>
                </>
              ) : (
                <>
                  <Menu className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold">Menu</span>
                </>
              )}
            </button>
          </div>

          {/* ROW 2: Current Project Selector Button (Full Width, 42px touch target) */}
          <div className="relative w-full" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="w-full min-h-[42px] flex items-center justify-between px-3.5 py-2 text-xs font-medium bg-[#111e38] light:bg-slate-100 hover:bg-[#172646] light:hover:bg-slate-200 text-slate-200 light:text-slate-800 border border-slate-700/80 light:border-slate-300 rounded-xl transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate font-semibold text-sm">{currentProject.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                {saveNotice && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
                    <Check className="w-3 h-3" /> saved
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {projectMenuOpen && renderProjectDropdown()}
          </div>

          {/* Clean Slide-out / Dropdown Menu for Mobile Navigation & Settings */}
          {mobileNavOpen && (
            <div className="mt-2 p-4 bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-200 rounded-2xl shadow-2xl space-y-4">
              
              {/* 1. DESIGN MODE */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-500 font-semibold mb-2">
                  Design Mode
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMode('quick');
                      setMobileNavOpen(false);
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                      activeMode === 'quick'
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-sm'
                        : 'bg-[#0b1329] light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-300 light:text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">Quick Design (Homeowner)</span>
                    </span>
                    <span className="text-xs">{activeMode === 'quick' ? '●' : '○'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectMode('engineering');
                      setMobileNavOpen(false);
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                      activeMode === 'engineering'
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-[#0b1329] light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-300 light:text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">Engineering Design (Full)</span>
                    </span>
                    <span className="text-xs">{activeMode === 'engineering' ? '●' : '○'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectMode('professional');
                      setMobileNavOpen(false);
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                      activeMode === 'professional'
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-sm'
                        : 'bg-[#0b1329] light:bg-slate-50 border-slate-800 light:border-slate-200 text-slate-300 light:text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm">Professional Validation</span>
                    </span>
                    <span className="text-xs">{activeMode === 'professional' ? '●' : '○'}</span>
                  </button>
                </div>
              </div>

              {/* 2. LANGUAGE & APPEARANCE */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 light:border-slate-100">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-500 font-semibold mb-1.5">
                    Language
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#0b1329] light:bg-slate-100 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onLanguageChange('en')}
                      className={`min-h-[38px] rounded-lg font-bold text-xs transition-colors ${
                        currentLang === 'en' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => onLanguageChange('fr')}
                      className={`min-h-[38px] rounded-lg font-bold text-xs transition-colors ${
                        currentLang === 'fr' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      FR
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-500 font-semibold mb-1.5">
                    Appearance
                  </div>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="w-full min-h-[46px] p-2 bg-[#0b1329] light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 light:text-slate-800"
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-slate-600" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. ACTIONS: SYSTEM REPORT & PROJECT ACTIONS */}
              <div className="pt-2 border-t border-slate-800 light:border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenReport();
                    setMobileNavOpen(false);
                  }}
                  className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Open System Engineering Report</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onNewProject();
                      setMobileNavOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#0b1329] light:bg-slate-50 border border-slate-800 flex items-center gap-2 text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.newProject}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSaveProject();
                      setMobileNavOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#0b1329] light:bg-slate-50 border border-slate-800 flex items-center gap-2 text-left"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t.saveProject}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onExportProject();
                      setMobileNavOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#0b1329] light:bg-slate-50 border border-slate-800 flex items-center gap-2 text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t.exportJson}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setMobileNavOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-[#0b1329] light:bg-slate-50 border border-slate-800 flex items-center gap-2 text-left"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.importJson}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Rename Modal Dialog */}
      {isRenaming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameSubmit}
            className="bg-[#111e38] light:bg-white border border-slate-700 light:border-slate-200 rounded-xl p-5 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-sm font-semibold text-white light:text-slate-900 mb-3">
              {t.renameProject}
            </h3>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm bg-[#0b1329] light:bg-slate-50 border border-slate-700 light:border-slate-300 rounded-lg text-white light:text-slate-900 mb-4 focus:outline-none focus:border-emerald-500 font-medium"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 light:text-slate-600 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

