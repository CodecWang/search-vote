import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import AddIcon from "@/icons/add-icon";
import CloseIcon from "@/icons/close-icon";

import { Input } from "./ui/input";

interface SettingsDrawerProps {
  open: boolean;
  searchEngines: SearchEngine[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (urlParamsMap: UrlParamsMap) => void;
}

export default function SettingsDrawer({
  open,
  onSubmit,
  onOpenChange,
  searchEngines,
}: SettingsDrawerProps) {
  const [urlParamsMap, setUrlParamsMap] = useState<UrlParamsMap>({});

  useEffect(() => {
    if (!open) return;
    if (!searchEngines.length) return;

    setUrlParamsMap(
      searchEngines.reduce((acc: UrlParamsMap, engine) => {
        const url = new URL(engine.url, window.location.origin);
        acc[engine.key] = Array.from(url.searchParams);
        return acc;
      }, {})
    );
  }, [open, searchEngines]);

  const addParam = (key: number) => {
    const params = urlParamsMap[key];
    if (params.find(([key]) => key === "")) return;

    params.push(["", ""]);
    setUrlParamsMap({ ...urlParamsMap });
  };

  const removeParam = (engineKey: number, key: string) => {
    const params = urlParamsMap[engineKey];
    urlParamsMap[engineKey] = params.filter((p) => p[0] !== key);
    setUrlParamsMap({ ...urlParamsMap });
  };

  const changeParam = (
    engineKey: number,
    index: number,
    value: string,
    isKey: boolean
  ) => {
    const params = urlParamsMap[engineKey];
    params[index][isKey ? 0 : 1] = value;
    setUrlParamsMap({ ...urlParamsMap });
  };

  const resetParams = (key: number) => {
    const engine = searchEngines.find((engine) => engine.key === key);
    if (!engine) return;

    const url = new URL(engine.url, window.location.origin);
    urlParamsMap[key] = Array.from(url.searchParams);
    setUrlParamsMap({ ...urlParamsMap });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Search engine settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-wrap gap-4 px-4 py-2">
          {searchEngines.map((engine) => (
            <div
              key={engine.key}
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg min-w-64 p-3"
            >
              <engine.icon className="size-5" />

              <div className="items-center space-y-1 mt-2">
                {urlParamsMap[engine.key]?.map(([key, value], index) => (
                  <div className="flex items-center gap-1" key={index}>
                    <Input
                      defaultValue={key}
                      className="w-20"
                      placeholder="setflight"
                      onChange={(e) =>
                        changeParam(engine.key, index, e.target.value, true)
                      }
                    ></Input>
                    <Input
                      defaultValue={value}
                      placeholder="xxx"
                      onChange={(e) =>
                        changeParam(engine.key, index, e.target.value, false)
                      }
                    ></Input>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParam(engine.key, key)}
                    >
                      <CloseIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                className="mt-1"
                variant="outline"
                size="icon"
                onClick={() => addParam(engine.key)}
              >
                <AddIcon className="size-4" />
              </Button>
              <div>
                <Button
                  className="mt-1"
                  variant="secondary"
                  onClick={() => resetParams(engine.key)}
                >
                  Reset
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button
            onClick={() => {
              onSubmit(urlParamsMap);
              onOpenChange(false);
            }}
          >
            Submit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
