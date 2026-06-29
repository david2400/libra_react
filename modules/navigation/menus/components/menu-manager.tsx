/** @format */

"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@repo/ui/modals/scenes";
import { RegisterMenu, UpdateMenu } from "./form";
import {
  HiPlus,
  HiSave,
  HiSearch,
  HiChevronRight,
  HiFolder,
  HiEye,
  HiEyeOff,
  HiPencil,
  HiTrash,
  HiChevronDown,
  HiChevronRight as HiChevronRightIcon,
} from "react-icons/hi";
import { LuMaximize2, LuMinimize2, LuGripVertical } from "react-icons/lu";
import { IMenu, IMenuWithDepth } from "../models/menu.interface";
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
import { ICreateMenu } from "@/server/domains/access-control/navigation/menus";
import { Input } from "@repo/ui/inputs/scenes/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SearchableSelect,
} from "@repo/ui/inputs/scenes/select";
// import { mockMenus, mockApplications, mockModules } from "../lib/mock-data";
import { IApplication } from "@/server/domains/access-control/security/applications";

// type IconName = keyof typeof LucideIcons;

// function getIcon(iconName?: string) {
//   if (!iconName) return null;
//   const Icon = LucideIcons[iconName as IconName];
//   if (!Icon || typeof Icon !== "function") return null;
//   return Icon;
// }

const emptyFormData: ICreateMenu = {
  application_id: 1,
  name: "",
  description: "",
  path: "",
  order: 0,
  parent_menu_id: 0,
  icon: "LayoutDashboard",
  visible: true,
};

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
  "border-l-lime-500",
  "border-l-amber-500",
  "border-l-violet-500",
  "border-l-fuchsia-500",
  "border-l-sky-500",
  "border-l-red-500",
];

function getDepthColor(depth: number): string {
  return DEPTH_COLORS[depth % DEPTH_COLORS.length];
}

// Calculate total children count recursively
function countChildren(menu: IMenu): number {
  if (!menu.children || menu.children.length === 0) return 0;
  return menu.children.reduce(
    (acc, child) => acc + 1 + countChildren(child),
    0,
  );
}

// Get the full path breadcrumb
function getMenuBreadcrumb(
  menu: IMenu,
  allMenus: IMenu[],
  maxParts = 3,
): string {
  const parts: string[] = [menu.name];
  let current = menu;

  const findParent = (
    parentId: number | undefined,
    menus: IMenu[],
  ): IMenu | undefined => {
    for (const m of menus) {
      if (m.id_menu === parentId) return m;
      if (m.children) {
        const found = findParent(parentId, m.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  while (current.parent_menu_id) {
    const parent = findParent(current.parent_menu_id, allMenus);
    if (parent) {
      parts.unshift(parent.name);
      current = parent;
    } else {
      break;
    }
  }

  if (parts.length > maxParts) {
    return `.../${parts.slice(-maxParts).join("/")}`;
  }
  return parts.join("/");
}

interface SortableMenuItemProps {
  menu: IMenu;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (menu: IMenu) => void;
  onDelete: (menu: IMenu) => void;
  onToggleVisibility: (menu: IMenu) => void;
  expandedIds: Set<number>;
  setExpandedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  allMenus: IMenu[];
  isCompactMode: boolean;
}

function MenuItemOverlay({ menu }: { menu: IMenu }) {
  // const Icon = getIcon(menu.icon);
  return (
    <div className='flex items-center gap-3 rounded-lg border border-primary bg-card p-3 shadow-xl'>
      <LuGripVertical className='h-4 w-4 text-muted-foreground' />
      {/* {Icon && (
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-secondary'>
          <Icon className='h-4 w-4 text-foreground' />
        </div>
      )} */}
      <span className='font-medium'>{menu.name}</span>
    </div>
  );
}

function SortableMenuItem({
  menu,
  depth,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onToggleVisibility,
  expandedIds,
  setExpandedIds,
  allMenus,
  isCompactMode,
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id_menu });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = menu.children && menu.children.length > 0;
  // const Icon = getIcon(menu.icon);
  const childCount = countChildren(menu);
  const depthColor = getDepthColor(depth);

  // For deep nesting, show a more compact indentation
  const indentSize = isCompactMode ? Math.min(depth * 12, 96) : depth * 20;
  const showDepthIndicator = depth > 0;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-2 border-l-2 bg-card transition-all",
          isDragging && "opacity-50 border-primary/50 shadow-lg z-10",
          !isDragging && "hover:bg-secondary/50",
          depthColor,
          isCompactMode ? "py-1.5 px-2" : "py-2.5 px-3",
          depth > 0 && "ml-2",
        )}>
        <div
          style={{ paddingLeft: `${indentSize}px` }}
          className='flex items-center gap-2 flex-1 min-w-0'>
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className='cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0'>
            <LuGripVertical
              className={cn("h-4 w-4", isCompactMode && "h-3.5 w-3.5")}
            />
          </button>

          {/* Depth indicator lines for deep nesting */}
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

          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={onToggle}
              className='text-muted-foreground hover:text-foreground shrink-0'>
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
          ) : (
            <div className={cn("w-4", isCompactMode && "w-3.5")} />
          )}

          {/* Menu Content */}
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            {/* {Icon && (
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-md bg-secondary",
                  isCompactMode ? "h-6 w-6" : "h-8 w-8",
                )}>
                <Icon
                  className={cn(
                    "text-foreground",
                    isCompactMode ? "h-3 w-3" : "h-4 w-4",
                  )}
                />
              </div>
            )} */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    "font-medium truncate",
                    !menu.visible && "text-muted-foreground",
                    isCompactMode ? "text-sm" : "text-base",
                  )}>
                  {menu.name}
                </span>
                {!menu.visible && (
                  <Badge
                    variant='outline'
                    className='text-xs bg-secondary/50 shrink-0'>
                    Hidden
                  </Badge>
                )}
                {hasChildren && (
                  <Badge variant='secondary' className='text-xs shrink-0'>
                    {childCount}
                  </Badge>
                )}
              </div>
              {!isCompactMode && menu.path && (
                <p className='text-xs text-muted-foreground truncate'>
                  {menu.path}
                </p>
              )}
            </div>
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
                  onClick={() => onToggleVisibility(menu)}>
                  {menu.visible ? (
                    <HiEye className='h-3.5 w-3.5 text-muted-foreground' />
                  ) : (
                    <HiEyeOff className='h-3.5 w-3.5 text-muted-foreground' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{menu.visible ? "Hide" : "Show"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn("h-7 w-7", isCompactMode && "h-6 w-6")}
                  onClick={() => onEdit(menu)}>
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
                  onClick={() => onDelete(menu)}>
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
          {menu.children!.map((child) => (
            <SortableMenuItem
              key={child.id_menu}
              menu={child}
              depth={depth + 1}
              isExpanded={expandedIds.has(child.id_menu)}
              onToggle={() => {
                setExpandedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(child.id_menu)) {
                    next.delete(child.id_menu);
                  } else {
                    next.add(child.id_menu);
                  }
                  return next;
                });
              }}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              expandedIds={expandedIds}
              setExpandedIds={setExpandedIds}
              allMenus={allMenus}
              isCompactMode={isCompactMode}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface IMenuManagerProps {
  initialData: IMenu[];
  initialApplications: IApplication[];
}

export const MenuManager = ({
  initialData,
  initialApplications,
}: IMenuManagerProps) => {
  const t = useTranslations("navigation.menus");
  const tOptions = useTranslations("common");
  const tActions = useTranslations("common");

  const [menus, setMenus] = useState<IMenu[]>(initialData);
  // const [menus, setMenus] = useState<IMenu[]>(mockMenus);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<number | null>(
    initialApplications.length > 0 ? initialApplications[0].id_application : null
  );
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    // Initially expand first 2 levels
    const ids = new Set<number>();
    const collectIds = (items: IMenu[], depth = 0) => {
      items.forEach((item) => {
        if (depth < 2) {
          ids.add(item.id_menu);
          if (item.children) collectIds(item.children, depth + 1);
        }
      });
    };
    collectIds(menus);
    return ids;
  });
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<IMenu | null>(null);
  const [formData, setFormData] = useState<ICreateMenu>(emptyFormData);
  const [deleteMenu, setDeleteMenu] = useState<IMenu | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleModalCloseEdit = () => {
    setOpenModalUpdate((prev) => !prev);
  };

  const flatMenus = useMemo(() => {
    const result: IMenuWithDepth[] = [];
    const flatten = (items: IMenu[], depth = 0) => {
      items.forEach((item) => {
        result.push({ ...item, depth });
        if (item.children) flatten(item.children, depth + 1);
      });
    };
    flatten(menus);
    return result;
  }, [menus]);

  // Calculate max depth
  const maxDepth = useMemo(() => {
    let max = 0;
    const findMaxDepth = (items: IMenu[], depth = 0) => {
      items.forEach((item) => {
        max = Math.max(max, depth);
        if (item.children) findMaxDepth(item.children, depth + 1);
      });
    };
    findMaxDepth(menus);
    return max;
  }, [menus]);

  const handleModalClose = () => {
    console.log("hola")
    setOpenModal((prev) => !prev);
  };

  const filteredMenus = useMemo(() => {
    if (!searchQuery) return menus;

    const filterMenus = (items: IMenu[]): IMenu[] => {
      return items
        .map((item) => {
          const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.path?.toLowerCase().includes(searchQuery.toLowerCase());
          const filteredChildren = item.children
            ? filterMenus(item.children)
            : undefined;

          if (
            matchesSearch ||
            (filteredChildren && filteredChildren.length > 0)
          ) {
            return { ...item, children: filteredChildren } as IMenu;
          }
          return null;
        })
        .filter((item) => item !== null) as IMenu[];
    };

    return filterMenus(menus);
  }, [menus, searchQuery]);

  // Get all possible parent options with their depth for indentation
  const getParentOptions = useCallback(() => {
    const options: {
      id: number;
      name: string;
      depth: number;
      path: string;
    }[] = [];
    const traverse = (items: IMenu[], depth = 0, pathParts: string[] = []) => {
      items.forEach((item) => {
        if (editingMenu && item.id_menu === editingMenu.id_menu) return;
        const currentPath = [...pathParts, item.name];
        options.push({
          id: item.id_menu,
          name: item.name,
          depth,
          path: currentPath.join(" / "),
        });
        if (item.children) traverse(item.children, depth + 1, currentPath);
      });
    };
    traverse(menus);
    return options;
  }, [menus, editingMenu]);

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (items: IMenu[]) => {
      items.forEach((item) => {
        allIds.add(item.id_menu);
        if (item.children) collectIds(item.children);
      });
    };
    collectIds(menus);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setHasChanges(true);
    }
  };

  const handleCreate = () => {
    setEditingMenu(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (menu: IMenu) => {
    setEditingMenu(menu);
    setFormData({
      application_id: menu.application_id,
      name: menu.name,
      description: menu.description,
      // protocol: menu.protocol || "https",
      // subdomain: menu.subdomain || "",
      // url: menu.url || "",
      // port: menu.port,
      path: menu.path || "",
      order: menu.order,
      // sort_order: menu.sort_order || 0,
      parent_menu_id: menu.parent_menu_id,
      icon: menu.icon || "LayoutDashboard",
      visible: menu.visible,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (menu: IMenu) => {
    setDeleteMenu(menu);
  };

  const confirmDelete = () => {
    if (!deleteMenu) return;

    const removeMenu = (items: IMenu[]): IMenu[] => {
      return items
        .filter((item) => item.id_menu !== deleteMenu.id_menu)
        .map((item) => ({
          ...item,
          children: item.children ? removeMenu(item.children) : undefined,
        }));
    };

    setMenus(removeMenu(menus));
    setDeleteMenu(null);
    setHasChanges(true);
  };

  const handleToggleVisibility = (menu: IMenu) => {
    const toggleVisibility = (items: IMenu[]): IMenu[] => {
      return items.map((item) => {
        if (item.id_menu === menu.id_menu) {
          return { ...item, visible: !item.visible };
        }
        if (item.children) {
          return { ...item, children: toggleVisibility(item.children) };
        }
        return item;
      });
    };

    setMenus(toggleVisibility(menus));
    setHasChanges(true);
  };

  const handleSaveMenu = () => {
    if (!formData.name.trim()) return;

    if (editingMenu) {
      const updateMenu = (items: IMenu[]): IMenu[] => {
        return items.map((item) => {
          if (item.id_menu === editingMenu.id_menu) {
            return { ...item, ...formData, id_menu: item.id_menu };
          }
          if (item.children) {
            return { ...item, children: updateMenu(item.children) };
          }
          return item;
        });
      };
      setMenus(updateMenu(menus));
    } else {
      const newMenu: IMenu = {
        ...formData,
        id_menu: Date.now(),
        children: [],
        deleted: false,
      };

      if (formData.parent_menu_id) {
        const addToParent = (items: IMenu[]): IMenu[] => {
          return items.map((item) => {
            if (item.id_menu === formData.parent_menu_id) {
              return {
                ...item,
                children: [...(item.children || []), newMenu],
              };
            }
            if (item.children) {
              return { ...item, children: addToParent(item.children) };
            }
            return item;
          });
        };
        setMenus(addToParent(menus));
      } else {
        setMenus([...menus, newMenu]);
      }
    }

    setIsDialogOpen(false);
    setEditingMenu(null);
    setFormData(emptyFormData);
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving menus:", menus);
    setHasChanges(false);
  };

  const activeMenu = activeId
    ? flatMenus.find((m) => m.id_menu === activeId)
    : null;
  const totalMenus = flatMenus.length;

  return (
    <section className='mx-auto flex w-full flex-col gap-6 px-6'>
      <div className='flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-foreground'>
              Menu Builder
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Build hierarchical menus with up to 16+ levels of nesting.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleModalClose}>
              <HiPlus className='mr-2 h-4 w-4' />
              Add Menu
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={!hasChanges}
              className='bg-primary text-primary-foreground hover:bg-primary/90'>
              <HiSave className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative flex-1 max-w-md'>
            <HiSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search menus...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 bg-secondary border-border'
            />
          </div>

          <div className='flex items-center gap-2'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' size='sm' onClick={expandAll}>
                    <LuMaximize2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expand all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' size='sm' onClick={collapseAll}>
                    <LuMinimize2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Collapse all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isCompactMode ? "default" : "outline"}
                    size='sm'
                    onClick={() => setIsCompactMode(!isCompactMode)}>
                    <HiChevronRight className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCompactMode ? "Normal mode" : "Compact mode"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats Bar */}
        <div className='flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4'>
          <div className='flex items-center gap-2'>
            <HiFolder className='h-5 w-5 text-muted-foreground' />
            <span className='text-sm font-medium text-foreground'>
              Application:
            </span>
            <SearchableSelect
              value={selectedApplication ? String(selectedApplication) : undefined}
              onValueChange={(value) => {
                // Manejar el cambio de aplicación
                setSelectedApplication(Number(value));
              }}
              placeholder='Seleccione una aplicación'
              searchPlaceholder='Buscar aplicación...'
              emptyMessage='No se encontraron aplicaciones'
              triggerClassName='w-auto bg-secondary border-border'
              options={initialApplications.map((app) => ({
                value: String(app.id_application),
                label: app.name,
                keywords: app.name, // Para búsqueda
              }))}
            />
          </div>

          <div className='flex items-center gap-4 ml-auto text-sm text-muted-foreground'>
            <span>
              Total:{" "}
              <span className='font-medium text-foreground'>{totalMenus}</span>{" "}
              menus
            </span>
            <span className='text-border'>|</span>
            <span>
              Max depth:{" "}
              <span className='font-medium text-foreground'>{maxDepth}</span>
            </span>
            {maxDepth > 5 && (
              <Badge
                variant='outline'
                className='bg-warning/10 text-warning border-warning/30'>
                Deep nesting
              </Badge>
            )}
          </div>
        </div>

        {/* Depth Legend for deep menus */}
        {maxDepth > 3 && (
          <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
            <span>Depth colors:</span>
            {Array.from({ length: Math.min(maxDepth + 1, 8) }, (_, i) => (
              <div key={i} className='flex items-center gap-1'>
                <div
                  className={cn(
                    "w-3 h-3 rounded-sm border-l-2",
                    DEPTH_COLORS[i],
                  )}
                />
                <span>{i}</span>
              </div>
            ))}
            {maxDepth > 7 && <span>...</span>}
          </div>
        )}

        {/* Menu Tree */}
        <div className='rounded-lg border border-border bg-card overflow-hidden'>
          <DndContext
            id='menu-manager-dnd'
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={flatMenus.map((m) => m.id_menu)}
              strategy={verticalListSortingStrategy}>
              <div className='divide-y divide-border/30'>
                {filteredMenus.map((menu) => (
                  <SortableMenuItem
                    key={menu.id_menu}
                    menu={menu}
                    depth={0}
                    isExpanded={expandedIds.has(menu.id_menu)}
                    onToggle={() => {
                      setExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(menu.id_menu)) {
                          next.delete(menu.id_menu);
                        } else {
                          next.add(menu.id_menu);
                        }
                        return next;
                      });
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    expandedIds={expandedIds}
                    setExpandedIds={setExpandedIds}
                    allMenus={menus}
                    isCompactMode={isCompactMode}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeMenu && <MenuItemOverlay menu={activeMenu} />}
            </DragOverlay>
          </DndContext>

          {filteredMenus.length === 0 && (
            <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <HiSearch className='h-8 w-8 mb-2' />
              <p>No menus found.</p>
            </div>
          )}
        </div>
        <Modal
          size='lg'
          title={"Crear menú"}
          open={openModal}
          onOpenChange={handleModalClose}>
          <RegisterMenu availableMenus={initialData} />
        </Modal>

        <Modal
          size='lg'
          open={openModalUpdate}
          onOpenChange={handleModalCloseEdit}
          title={t("modal.edit_title")}
          description={t("modal.edit_description")}
          showCloseButton={true}
          hideDefaultFooter={true}>
          <UpdateMenu
            initialValues={editingMenu}
            availableMenus={initialData}
            handleClose={handleModalCloseEdit}
          />
        </Modal>
      </div>
    </section>
  );
};
