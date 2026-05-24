 /** @format */

"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@repo/ui/modals/scenes";
import { Buttons } from "@repo/ui/buttons/scenes";
import { RegisterModuleApplication, UpdateModuleApplication } from "./form";
import {
  HiOutlineCube,
  HiOutlinePlusCircle,
  HiChevronDown,
  HiChevronRight,
  HiEye,
} from "react-icons/hi2";
import { HiFolder, HiFolderOpen } from "react-icons/hi";
import { BiCalendar, BiHash, BiFolder } from "react-icons/bi";
import { MdDateRange } from "react-icons/md";
import { IModuleApplication } from "../models/module-application.interface";
import { Button } from "@repo/ui/buttons/scenes/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip/scenes/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { cn } from "@repo/ui/utils";
import { BsTrash2 } from "react-icons/bs";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { CgCornerDownRight } from "react-icons/cg";
import { Input } from "@repo/ui/inputs/scenes/input";
import { LuMaximize2, LuMinimize2 } from "react-icons/lu";

// Generate depth colors for visual hierarchy
const DEPTH_COLORS = [
  "border-l-emerald-500",
  "border-l-blue-500",
  "border-l-purple-500",
  "border-l-orange-500",
  "border-l-pink-500",
  "border-l-cyan-500",
  "border-l-yellow-500",
  "border-l-rose-500",
  "border-l-indigo-500",
  "border-l-teal-500",
];

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[depth % DEPTH_COLORS.length];
}

// Calculate total children count recursively
function countChildren(module: IModuleApplication): number {
  if (!Array.isArray(module.parent_module_application) || module.parent_module_application.length === 0) return 0;
  return module.parent_module_application.reduce(
    (acc, child) => acc + 1 + countChildren(child),
    0,
  );
}

interface ModuleItemProps {
  module: IModuleApplication;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (module: IModuleApplication) => void;
  onDelete: (module: IModuleApplication) => void;
  expandedIds: Set<number>;
  setExpandedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  isCompactMode: boolean;
}

function ModuleItem({
  module,
  depth,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  expandedIds,
  setExpandedIds,
  isCompactMode,
}: ModuleItemProps) {
  const hasChildren = Array.isArray(module.parent_module_application) && module.parent_module_application.length > 0;
  const childCount = countChildren(module);
  const depthColor = getDepthColor(depth);
  const indentSize = isCompactMode ? Math.min(depth * 12, 96) : depth * 20;
  const showDepthIndicator = depth > 0;

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-3 border-l-4 bg-gradient-to-r from-card to-card/50 transition-all duration-200",
          "hover:from-secondary/30 hover:to-secondary/10 hover:shadow-sm",
          depthColor,
          isCompactMode ? "py-2 px-3" : "py-3 px-4",
          depth > 0 && "ml-2",
          module.deleted && "opacity-60",
        )}>
        <div
          style={{ paddingLeft: `${indentSize}px` }}
          className='flex items-center gap-2 flex-1 min-w-0'>
          {/* Depth indicator */}
          {showDepthIndicator && depth > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex items-center gap-0.5 text-muted-foreground'>
                    <CgCornerDownRight className='h-3 w-3' />
                    <span className='text-xs font-mono'>{depth}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Depth level: {depth}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Folder Icon & Expand/Collapse */}
          <div className='flex items-center gap-2 shrink-0'>
            {hasChildren ? (
              <>
                <div className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 transition-colors",
                  isExpanded ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {isExpanded ? (
                    <HiFolderOpen className={cn("h-5 w-5", isCompactMode && "h-4 w-4")} />
                  ) : (
                    <HiFolder className={cn("h-5 w-5", isCompactMode && "h-4 w-4")} />
                  )}
                </div>
                <button
                  onClick={onToggle}
                  className='text-muted-foreground hover:text-foreground transition-colors shrink-0'>
                  {isExpanded ? (
                    <HiChevronDown
                      className={cn("h-4 w-4", isCompactMode && "h-3.5 w-3.5")}
                    />
                  ) : (
                    <HiChevronRight
                      className={cn("h-4 w-4", isCompactMode && "h-3.5 w-3.5")}
                    />
                  )}
                </button>
              </>
            ) : (
              <div className={cn(
                "flex items-center justify-center rounded-lg bg-secondary/50 p-1.5",
                isCompactMode ? "h-7 w-7" : "h-8 w-8"
              )}>
                <BiFolder className={cn("h-4 w-4 text-muted-foreground", isCompactMode && "h-3.5 w-3.5")} />
              </div>
            )}
          </div>

          {/* Module Content */}
          <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
            {/* Title Row */}
            <div className='flex items-center gap-2 flex-wrap'>
              <span
                className={cn(
                  "font-semibold truncate",
                  module.deleted && "text-muted-foreground line-through",
                  isCompactMode ? "text-sm" : "text-base",
                )}>
                {module.name}
              </span>
              
              {/* Badges */}
              <div className='flex items-center gap-1.5 flex-wrap'>
                {module.deleted && (
                  <Badge
                    variant='outline'
                    className='text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'>
                    Eliminado
                  </Badge>
                )}
                {hasChildren && (
                  <Badge 
                    variant='secondary' 
                    className='text-xs bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'>
                    {childCount} {childCount === 1 ? 'hijo' : 'hijos'}
                  </Badge>
                )}
                {module.level !== undefined && module.level !== null && (
                  <Badge 
                    variant='outline'
                    className='text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'>
                    <BiHash className='h-3 w-3 mr-0.5' />
                    Nivel {module.level}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {!isCompactMode && module.description && (
              <p className='text-xs text-muted-foreground line-clamp-1'>
                {module.description}
              </p>
            )}

            {/* Metadata Row */}
            {!isCompactMode && (
              <div className='flex items-center gap-3 text-xs text-muted-foreground flex-wrap'>
                {module.application && (
                  <div className='flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md'>
                    <HiOutlineCube className='h-3.5 w-3.5' />
                    <span className='font-medium'>{module.application.name}</span>
                  </div>
                )}
                {module.path && (
                  <div className='flex items-center gap-1'>
                    <BiFolder className='h-3.5 w-3.5' />
                    <span className='font-mono'>{module.path}</span>
                  </div>
                )}
                {module.publication_date && (
                  <div className='flex items-center gap-1'>
                    <MdDateRange className='h-3.5 w-3.5' />
                    <span>{new Date(module.publication_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn("h-7 w-7", isCompactMode && "h-6 w-6")}
                  onClick={() => onEdit(module)}>
                  <FiEdit2 className='h-3.5 w-3.5 text-muted-foreground' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn(
                    "h-7 w-7 hover:text-destructive",
                    isCompactMode && "h-6 w-6",
                  )}
                  onClick={() => onDelete(module)}>
                  <BsTrash2 className='h-3.5 w-3.5 text-muted-foreground' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className='border-l border-border/50 ml-3'>
          {module.parent_module_application!.map((child, childIndex) => (
            <ModuleItem
              key={child.id_modules_application || `child-${depth}-${childIndex}`}
              module={child}
              depth={depth + 1}
              isExpanded={expandedIds.has(child.id_modules_application || childIndex)}
              onToggle={() => {
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(child.id_modules_application)) {
                    next.delete(child.id_modules_application);
                  } else {
                    next.add(child.id_modules_application);
                  }
                  return next;
                });
              }}
              onEdit={onEdit}
              onDelete={onDelete}
              expandedIds={expandedIds}
              setExpandedIds={setExpandedIds}
              isCompactMode={isCompactMode}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface IModuleApplicationManagerProps {
  initialData: IModuleApplication[];
}

export const ModuleApplicationManager = ({
  initialData,
}: IModuleApplicationManagerProps) => {
  const t = useTranslations("security.modulesApplications");
  const tActions = useTranslations("actions");

  const [modules, setModules] = useState<IModuleApplication[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    // Initially expand first 2 levels
    const ids = new Set<number>();
    const collectIds = (items: IModuleApplication[], depth = 0) => {
      items.forEach((item) => {
        if (depth < 2 && item.id_modules_application) {
          ids.add(item.id_modules_application);
          if (Array.isArray(item.parent_module_application) && item.parent_module_application.length > 0) {
            collectIds(item.parent_module_application, depth + 1);
          }
        }
      });
    };
    collectIds(initialData);
    return ids;
  });
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingModuleApplication, setEditingModuleApplication] =
    useState<IModuleApplication | null>(null);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const metrics = useMemo(() => {
    const flattenModules = (items: IModuleApplication[]): IModuleApplication[] => {
      return items.reduce((acc, item) => {
        acc.push(item);
        if (Array.isArray(item.parent_module_application) && item.parent_module_application.length > 0) {
          acc.push(...flattenModules(item.parent_module_application));
        }
        return acc;
      }, [] as IModuleApplication[]);
    };

    const allModules = flattenModules(modules);
    const activeModules = allModules.filter((m) => !m.deleted).length;
    const uniqueApplications = new Set(
      allModules.map((m) => m.application_id),
    ).size;

    return {
      totalModules: allModules.length,
      activeModules,
      uniqueApplications,
    };
  }, [modules]);

  const maxDepth = useMemo(() => {
    let max = 0;
    const findMaxDepth = (items: IModuleApplication[], depth = 0) => {
      items.forEach((item) => {
        max = Math.max(max, depth);
        if (Array.isArray(item.parent_module_application) && item.parent_module_application.length > 0) {
          findMaxDepth(item.parent_module_application, depth + 1);
        }
      });
    };
    findMaxDepth(modules);
    return max;
  }, [modules]);

  const filteredModules = useMemo(() => {
    if (!searchQuery) return modules;

    const filterModules = (items: IModuleApplication[]): IModuleApplication[] => {
      return items
        .map((item) => {
          const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
          const filteredChildren = Array.isArray(item.parent_module_application) && item.parent_module_application.length > 0
            ? filterModules(item.parent_module_application)
            : undefined;

          if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
            return { ...item, parent_module_application: filteredChildren } as IModuleApplication;
          }
          return null;
        })
        .filter((item) => item !== null) as IModuleApplication[];
    };

    return filterModules(modules);
  }, [modules, searchQuery]);

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (items: IModuleApplication[]) => {
      items.forEach((item) => {
        if (item.id_modules_application) {
          allIds.add(item.id_modules_application);
        }
        if (Array.isArray(item.parent_module_application) && item.parent_module_application.length > 0) {
          collectIds(item.parent_module_application);
        }
      });
    };
    collectIds(modules);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleEdit = (module: IModuleApplication) => {
    setEditingModuleApplication(module);
    setOpenModalUpdate(true);
  };

  const handleDelete = (module: IModuleApplication) => {
    // Implement delete logic
    console.log("Delete module:", module);
  };


  const summaryCards = [
    {
      icon: HiOutlineCube,
      label: "Total módulos",
      value: metrics.totalModules,
      accent: "from-sky-500/40 to-blue-500/40 text-sky-700",
    },
    {
      icon: HiOutlineCube,
      label: "Módulos activos",
      value: metrics.activeModules,
      accent: "from-emerald-500/40 to-teal-500/40 text-emerald-700",
    },
    {
      icon: HiOutlineCube,
      label: "Aplicaciones únicas",
      value: metrics.uniqueApplications,
      accent: "from-amber-500/40 to-orange-500/40 text-amber-700",
    },
    {
      icon: HiOutlineCube,
      label: "Profundidad máxima",
      value: maxDepth + 1,
      accent: "from-purple-500/40 to-pink-500/40 text-purple-700",
    },
  ];

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <article className='rounded-3xl border border-border/40 bg-gradient-to-br from-sky-600 via-blue-500 to-indigo-600 px-8 py-10 text-white shadow-2xl'>
        <header className='space-y-4'>
          <span className='inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>
            {t("title")}
          </span>
          <div className='space-y-2'>
            <h1 className='text-4xl font-semibold leading-tight'>
              {t("description")}
            </h1>
            <p className='text-white/80'>
              Asigna módulos a aplicaciones del ecosistema.
            </p>
          </div>
          <Buttons
            color='success'
            className='inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-white'
            onClick={() => setOpenModal(true)}>
            <HiOutlinePlusCircle className='h-4 w-4' />
            {tActions("saveModuleApplication")}
          </Buttons>
        </header>
      </article>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-border/40 bg-gradient-to-br ${card.accent} px-5 py-4 shadow-sm backdrop-blur`}>
            <div className='flex items-center justify-between text-sm font-semibold text-white/80'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-white/70' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-white'>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tree View Controls */}
      <div className='rounded-2xl border border-border/40 bg-card p-4 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
          <div className='flex items-center gap-2'>
            <Input
              type='text'
              placeholder='Buscar módulos...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-64'
            />
            {searchQuery && (
              <Badge variant='secondary'>
                {filteredModules.length} resultados
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={expandAll}
              className='gap-2'>
              <LuMaximize2 className='h-4 w-4' />
              Expandir todo
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={collapseAll}
              className='gap-2'>
              <LuMinimize2 className='h-4 w-4' />
              Colapsar todo
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsCompactMode(!isCompactMode)}
              className='gap-2'>
              {isCompactMode ? "Vista normal" : "Vista compacta"}
            </Button>
          </div>
        </div>

        {/* Hierarchical Tree View */}
        <div className='rounded-xl border-2 border-border/40 bg-gradient-to-br from-background to-secondary/5 overflow-hidden shadow-sm'>
          {filteredModules.length > 0 ? (
            <div className='divide-y divide-border/30'>
              {filteredModules.map((module, index) => (
                <ModuleItem
                  key={module.id_modules_application || `module-${index}`}
                  module={module}
                  depth={0}
                  isExpanded={expandedIds.has(module.id_modules_application || index)}
                  onToggle={() => {
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(module.id_modules_application)) {
                        next.delete(module.id_modules_application);
                      } else {
                        next.add(module.id_modules_application);
                      }
                      return next;
                    });
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  expandedIds={expandedIds}
                  setExpandedIds={setExpandedIds}
                  isCompactMode={isCompactMode}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center p-12 text-center'>
              <div className='rounded-full bg-secondary/50 p-4 mb-4'>
                <HiFolder className='h-12 w-12 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                {searchQuery ? "Sin resultados" : "No hay módulos"}
              </h3>
              <p className='text-sm text-muted-foreground max-w-sm'>
                {searchQuery
                  ? "No se encontraron módulos que coincidan con tu búsqueda. Intenta con otros términos."
                  : "Aún no hay módulos de aplicación creados. Comienza creando uno nuevo."}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        size='lg'
        title='Asignar módulo a aplicación'
        open={openModal}
        onOpenChange={() => setOpenModal(!openModal)}>
        <RegisterModuleApplication />
      </Modal>

      <Modal
        size='lg'
        open={openModalUpdate}
        onOpenChange={() => setOpenModalUpdate(!openModalUpdate)}
        title={t("modal.edit_title")}
        showCloseButton={true}
        hideDefaultFooter={true}>
        <UpdateModuleApplication
          initialValues={editingModuleApplication}
          handleClose={() => setOpenModalUpdate(false)}
        />
      </Modal>
    </section>
  );
};
