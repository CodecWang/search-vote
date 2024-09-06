"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";

import SettingsDrawer from "@/components/settings-drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/toaster";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EngineName } from "@/enums";
import { useToast } from "@/hooks/use-toast";
import AddIcon from "@/icons/add-icon";
import BaiduIcon from "@/icons/baidu-icon";
import BingIcon from "@/icons/bing-icon";
import CloseIcon from "@/icons/close-icon";
import DuckDuckGoIcon from "@/icons/duck-duck-go-icon";
import GoogleIcon from "@/icons/google-icon";
import SettingsIcon from "@/icons/settings-icon";
import { uniqueNumberGenerator } from "@/utils/unique-number";

export default function Home() {
  const generatorRef = useRef(uniqueNumberGenerator());
  const generateUniqueNumber = useCallback(
    () => generatorRef.current.generateUniqueNumber(),
    []
  );
  const removeNumber = useCallback(
    (num: number) => generatorRef.current.removeNumber(num),
    []
  );

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initLoadRef = useRef(true);
  const timeoutRef = useRef({} as NodeJS.Timeout);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const [showSize, setShowWidth] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showResizer, setShowResizer] = useState(true);
  const [isVertical, setIsVertical] = useState(true);
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([]);

  const [searchEngineMenu] = useState<SearchEngineMenuItem[]>([
    {
      name: EngineName.Bing,
      icon: BingIcon,
    },
    {
      name: EngineName.Google,
      icon: GoogleIcon,
    },
    {
      name: EngineName.Baidu,
      icon: BaiduIcon,
    },
    {
      name: EngineName.DuckDuckGo,
      icon: DuckDuckGoIcon,
    },
  ]);

  const createSearchEngine = useCallback(
    (
      name: EngineName,
      icon: (_: IconProps) => JSX.Element,
      query?: string | null,
      existingEngine?: SearchEngine
    ) => {
      if (existingEngine) {
        return {
          ...existingEngine,
          ref: React.createRef<ImperativePanelHandle>(),
          key: generateUniqueNumber(),
        };
      }

      const searchQuery = query ?? "flowers";
      const urlMap = new Map<EngineName, string>([
        [EngineName.Bing, `https://www.bing.com/search?q=${searchQuery}`],
        [
          EngineName.Google,
          `https://www.google.com/search?q=${searchQuery}&igu=1&hl=en`,
        ],
        [EngineName.Baidu, `/api/baidu/s?wd=${searchQuery}`],
        [EngineName.DuckDuckGo, `/api/duckduckgo/?q=${searchQuery}`],
      ]);

      return {
        name,
        icon,
        url: urlMap.get(name) ?? "",
        ref: React.createRef<ImperativePanelHandle>(),
        key: generateUniqueNumber(),
      };
    },
    [generateUniqueNumber]
  );

  useEffect(() => {
    if (!initLoadRef.current) return;

    const dir = searchParams.get("dir");
    setIsVertical(dir === "h" ? false : true);

    const defaultQuery = searchParams.get("q") ?? "flowers";
    setSearchEngines([
      createSearchEngine(EngineName.Bing, BingIcon, defaultQuery),
      createSearchEngine(EngineName.Google, GoogleIcon, defaultQuery),
    ]);

    initLoadRef.current = false;
  }, [searchParams, createSearchEngine]);

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;

    const newQuery = (event.target as HTMLInputElement).value;
    const params = new URLSearchParams(searchParams);
    params.set("q", newQuery);
    router.push(`?${params.toString()}`);

    const engineQueryNameMap = {
      [EngineName.Bing]: [["q", newQuery]],
      [EngineName.Google]: [["q", newQuery]],
      [EngineName.Baidu]: [["wd", newQuery]],
      [EngineName.DuckDuckGo]: [["q", newQuery]],
    };

    const urlParamsMap = searchEngines.reduce((acc: UrlParamsMap, engine) => {
      acc[engine.key] = engineQueryNameMap[engine.name as EngineName];
      return acc;
    }, {});

    handleParamsChange(urlParamsMap, false);
  };

  const handleParamsChange = (paramsMap: UrlParamsMap, isClean = true) => {
    Object.entries(paramsMap).forEach(([key, params]) => {
      const engine = searchEngines.find((engine) => engine.key === +key);
      if (!engine) return;

      const url = new URL(engine.url, window.location.origin);
      isClean && (url.search = "");
      params.forEach(([key, value]) => {
        if (key) {
          url.searchParams.set(key, value);
        }
      });

      engine.url = url.toString();

      setSearchEngines((prevEngines) => [...prevEngines]);
    });
  };

  const addSearchEngine = (menuItem: SearchEngineMenuItem) => {
    if (searchEngines.length >= 4) {
      toast({
        title: "Can only compare up to three search engines at a time.",
        description:
          "You can remove one of the existing search engines to add a new one.",
      });
      return;
    }

    const existingEngine = searchEngines.findLast(
      (engine) => engine.name === name
    );

    const engine = createSearchEngine(
      menuItem.name,
      menuItem.icon,
      searchParams.get("q"),
      existingEngine
    );
    setSearchEngines((prevEngines) => [...prevEngines, engine]);
  };

  const removeSearchEngine = (key: number) => {
    removeNumber(key);
    setSearchEngines((prevEngines) => prevEngines.filter((e) => e.key !== key));
  };

  const toggleSearchEngine = (engine: SearchEngine) => {
    if (searchEngines.length <= 1) return;

    const ele = engine.ref?.current;
    if (!ele) return;

    ele.isCollapsed() ? ele.expand() : ele.collapse();
  };

  const resetLayout = () => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    const { length } = searchEngines;
    if (!length) return;

    panelGroup.setLayout(Array(length).fill(100 / length));
  };

  const onLayoutChange = () => {
    setSearchEngines((prevEngines) => [...prevEngines]);

    setShowWidth(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowWidth(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-lvh p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="mb-4 rounded-lg bg-card text-card-foreground shadow flex-grow overflow-hidden">
        <ResizablePanelGroup
          ref={panelGroupRef}
          direction={isVertical ? "horizontal" : "vertical"}
          onLayout={onLayoutChange}
        >
          {searchEngines.map((engine, index) => (
            <React.Fragment key={engine.key}>
              <ResizablePanel collapsible ref={engine.ref} className="relative">
                {showToolbar && (
                  <div className="px-2 py-1 text-xs flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-6"
                      onClick={() => setShowDrawer(true)}
                    >
                      <SettingsIcon className="size-4" />
                    </Button>
                    <span className="text-gray-400 text-ellipsis text-nowrap">
                      {engine.url}
                    </span>
                  </div>
                )}
                {showSize && (
                  <div className="absolute bottom-0 left-0 bg-slate-400 py-1 px-2 text-sm">
                    {document
                      .querySelector(
                        `[data-panel-id="${engine.ref?.current?.getId()}"]`
                      )
                      ?.getClientRects()?.[0]
                      .width.toFixed(0)}
                  </div>
                )}
                <iframe
                  name={`${name}Frame`}
                  id={`${name}Frame`}
                  frameBorder="0"
                  referrerPolicy="no-referrer"
                  className="w-full h-full"
                  src={engine.url}
                  key={engine.url}
                ></iframe>
              </ResizablePanel>
              {index < searchEngines.length - 1 && (
                <ResizableHandle
                  withHandle={showResizer}
                  disabled={!showResizer}
                />
              )}
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      </div>
      <div className="flex items-center">
        <div className="flex items-center flex-1 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  className="p-1"
                  src="https://pickbold.com/wp-content/uploads/2022/02/bing-logo.png"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={resetLayout}
                disabled={searchEngines.length <= 1}
              >
                Reset layout
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Layout</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      disabled={isVertical}
                      onClick={() => setIsVertical(true)}
                    >
                      Vertical
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!isVertical}
                      onClick={() => setIsVertical(false)}
                    >
                      Horizental
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowResizer(!showResizer)}>
                {showResizer ? "Disable risizer" : "Enable risizer"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowToolbar(!showToolbar)}>
                {showToolbar ? "Hide toolbar" : "Show toolbar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDrawer(true)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="https://github.com/CodecWang" target="_blank">
                  About
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            placeholder="Query for all search engines"
            onKeyDown={handleInputKeyDown}
            className="w-64 rounded-full"
          ></Input>
        </div>

        <div className="flex items-center gap-1">
          <ToggleGroup
            type="multiple"
            value={searchEngines
              .filter((engine) => !engine.ref?.current?.isCollapsed())
              .map(({ key }) => key.toString())}
          >
            {searchEngines.map((engine, index) => (
              <div className="relative group" key={engine.key}>
                <ToggleGroupItem
                  value={engine.key.toString()}
                  onClick={() => toggleSearchEngine(engine)}
                >
                  <engine.icon className="size-5" />
                </ToggleGroupItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 size-3 -m-1 hidden group-hover:block text-zinc-500"
                  onClick={() => removeSearchEngine(engine.key)}
                >
                  <CloseIcon className="size-3" />
                </Button>
              </div>
            ))}
          </ToggleGroup>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <AddIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {searchEngineMenu.map((engine) => (
                <DropdownMenuItem
                  key={engine.name}
                  onSelect={() => addSearchEngine(engine)}
                >
                  <engine.icon className="size-4 mr-2" />
                  {engine.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SettingsDrawer
        open={showDrawer}
        onOpenChange={setShowDrawer}
        searchEngines={searchEngines}
        onSubmit={handleParamsChange}
      />
      <Toaster />
    </div>
  );
}
