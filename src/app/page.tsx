"use client";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImperativePanelGroupHandle } from "react-resizable-panels";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import GoogleIcon from "@/icons/google-icon";
import BaiduIcon from "@/icons/baidu-icon";
import BingIcon from "@/icons/bing-icon";
import DuckDuckGoIcon from "@/icons/duck-duck-go-icon";
import AddIcon from "@/icons/add-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import SettingsIcon from "@/icons/settings-icon";
import SettingsDrawer from "@/components/settings-drawer";
import { Toaster } from "@/components/ui/toaster";
import CloseIcon from "@/icons/close-icon";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

enum EngineName {
  Bing = "bing",
  Google = "google",
  Baidu = "baidu",
  DuckDuckGo = "duckduckgo",
}

export default forwardRef(() => {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const timeoutRef = useRef({} as NodeJS.Timeout);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const [showWidth, setShowWidth] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showResizer, setShowResizer] = useState(true);
  const [isVertical, setIsVertical] = useState(true);

  const [allEnginesMap, setAllEnginesMap] = useState<SearchEngineMap>({});
  const [selectedEngines, setSelectedEngines] = useState<
    [string, SearchEngineParam][]
  >([]);

  useEffect(() => {
    const dir = searchParams.get("dir");
    setIsVertical(dir === "h" ? false : true);

    const defaultQuery = searchParams.get("q") ?? "flowers";
    const encodedQuery = encodeURIComponent(defaultQuery);

    const engineMap: SearchEngineMap = {
      [EngineName.Bing]: {
        url: `https://www.bing.com/search?q=${encodedQuery}`,
        icon: BingIcon,
        selected: true,
        ref: React.createRef(),
      },
      [EngineName.Google]: {
        // igu: ignore user/iframe google url
        url: `https://www.google.com/search?igu=1&q=${encodedQuery}&hl=en`,
        icon: GoogleIcon,
        selected: true,
        ref: React.createRef(),
      },
      [EngineName.Baidu]: {
        url: `/api/baidu/s?wd=${encodedQuery}`,
        icon: BaiduIcon,
        ref: React.createRef(),
      },
      [EngineName.DuckDuckGo]: {
        url: `/api/duckduckgo/?q=${encodedQuery}`,
        icon: DuckDuckGoIcon,
        ref: React.createRef(),
      },
    };

    setAllEnginesMap(engineMap);
  }, []);

  useEffect(() => {
    setSelectedEngines(
      Object.entries(allEnginesMap).filter(([_, engine]) => engine.selected)
    );
  }, [allEnginesMap]);

  const handleResetLayout = () => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    panelGroup.setLayout(
      Array(selectedEngines.length).fill(100 / selectedEngines.length)
    );
  };

  const handleToggleCollapse = (engine: SearchEngineParam) => {
    const ele = engine.ref?.current;
    if (!ele) return;

    ele.isCollapsed() ? ele.expand() : ele.collapse();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;

    const encodedQuery = encodeURIComponent(
      (event.target as HTMLInputElement).value
    );
    const searchParamsMap = {
      [EngineName.Bing]: [["q", encodedQuery]],
      [EngineName.Google]: [["q", encodedQuery]],
      [EngineName.Baidu]: [["wd", encodedQuery]],
      [EngineName.DuckDuckGo]: [["q", encodedQuery]],
    };

    handleParamsChange(searchParamsMap, false);
  };

  const handleAddEngine = (name: string, param: SearchEngineParam) => {
    if (selectedEngines.length >= 3) {
      toast({
        title: "Can only compare up to three search engines at a time.",
        description:
          "You can remove one of the existing search engines to add a new one.",
      });
      return;
    }

    setAllEnginesMap((prevEngines) => ({
      ...prevEngines,
      [name]: { ...param, selected: true },
    }));
  };

  const handleRemoveEngine = (name: string) => {
    setAllEnginesMap((prevEngines) => ({
      ...prevEngines,
      [name]: { ...prevEngines[name], selected: false },
    }));
  };

  const hanldeLayoutChange = () => {
    setAllEnginesMap((prevEngines) => ({ ...prevEngines }));

    setShowWidth(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowWidth(false);
    }, 1000);
  };

  const handleParamsChange = (
    searchParamsMap: {
      [key: string]: [string, string][];
    },
    isClean = true
  ) => {
    Object.entries(searchParamsMap).forEach(([name, param]) => {
      const url = new URL(allEnginesMap[name].url, window.location.origin);
      isClean && (url.search = "");
      param.forEach(([key, value]) => {
        if (key) {
          url.searchParams.set(key, value);
        }
      });

      setAllEnginesMap((prevEngines) => ({
        ...prevEngines,
        [name]: { ...prevEngines[name], url: url.toString() },
      }));
    });
  };

  return (
    <div className="flex flex-col h-lvh p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="mb-4 rounded-lg bg-card text-card-foreground shadow flex-grow overflow-hidden">
        <ResizablePanelGroup
          ref={panelGroupRef}
          direction={isVertical ? "horizontal" : "vertical"}
          onLayout={hanldeLayoutChange}
        >
          {selectedEngines.map(([name, param], index) => (
            <React.Fragment key={index}>
              <ResizablePanel collapsible ref={param.ref} className="relative">
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
                      {param.url}
                    </span>
                  </div>
                )}
                {showWidth && (
                  <div className="absolute bottom-0 left-0 bg-slate-400 py-1 px-2 text-sm">
                    {document
                      .querySelector(
                        `[data-panel-id="${param.ref.current?.getId()}"]`
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
                  src={param.url}
                  key={param.url}
                ></iframe>
              </ResizablePanel>
              {index < selectedEngines.length - 1 && (
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
              <DropdownMenuItem onClick={handleResetLayout}>
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
            value={selectedEngines
              .filter(([_, value]) => !value.ref.current?.isCollapsed())
              .map(([name]) => name)}
          >
            {selectedEngines.map(([name, param], index) => (
              <div className="relative group" key={index}>
                <ToggleGroupItem
                  key={name}
                  value={name}
                  onClick={() => handleToggleCollapse(param)}
                >
                  <param.icon className="size-5" />
                </ToggleGroupItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 size-3 -m-1 hidden group-hover:block text-zinc-500"
                  onClick={() => handleRemoveEngine(name)}
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
              {Object.entries(allEnginesMap).map(([name, param]) => (
                <DropdownMenuItem
                  onSelect={() => handleAddEngine(name, param)}
                  key={name}
                  disabled={param.selected}
                >
                  <param.icon className="size-4 mr-2" />
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SettingsDrawer
        open={showDrawer}
        onOpenChange={setShowDrawer}
        searchEngines={selectedEngines}
        onSubmit={handleParamsChange}
      />
      <Toaster />
    </div>
  );
});
