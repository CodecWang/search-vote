import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import AddIcon from "@/icons/add-icon";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import CloseIcon from "@/icons/close-icon";

interface SettingsDrawerProps {
  open: boolean;
  onSubmit: (searchParamsMap: { [key: string]: [string, string][] }) => void;
  onOpenChange: (open: boolean) => void;
  searchEngines: [string, SearchEngineParam][];
}

export default function SettingsDrawer({
  open,
  onSubmit,
  onOpenChange,
  searchEngines,
}: SettingsDrawerProps) {
  const [searchParamsMap, setSearchParamsMap] = useState<{
    [key: string]: [string, string][];
  }>({});

  useEffect(() => {
    if (!open) return;
    if (!searchEngines?.length) return;

    searchEngines.forEach(([name, param]) => {
      const url = new URL(param.url, window.location.origin);
      searchParamsMap[name] = Array.from(url.searchParams);
    });

    setSearchParamsMap({ ...searchParamsMap });
  }, [open]);

  const hanldeAddParam = (name: string) => {
    const params = searchParamsMap[name];
    if (params.find(([key]) => key === "")) return;

    params.push(["", ""]);
    setSearchParamsMap({ ...searchParamsMap });
  };

  const handleRemoveParam = (name: string, key: string) => {
    const params = searchParamsMap[name];
    searchParamsMap[name] = params.filter((p) => p[0] !== key);
    setSearchParamsMap({ ...searchParamsMap });
  };

  const handleChangeParam = (
    name: string,
    index: number,
    value: string,
    isKey: boolean
  ) => {
    const params = searchParamsMap[name];
    params[index][isKey ? 0 : 1] = value;
    setSearchParamsMap({ ...searchParamsMap });
  };

  const handleReset = (name: string, engine: SearchEngineParam) => {
    const url = new URL(engine.url, window.location.origin);
    searchParamsMap[name] = Array.from(url.searchParams);
    setSearchParamsMap({ ...searchParamsMap });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Search engine settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-wrap gap-4 px-4 py-2">
          {searchEngines.map(([name, param]) => (
            <div
              key={name}
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg min-w-64 p-3"
            >
              <param.icon className="size-5" />

              <div className="items-center space-y-1 mt-2">
                {searchParamsMap[name]?.map(([key, value], index) => (
                  <div className="flex items-center gap-1" key={index}>
                    <Input
                      defaultValue={key}
                      className="w-20"
                      placeholder="setflight"
                      onChange={(e) =>
                        handleChangeParam(name, index, e.target.value, true)
                      }
                    ></Input>
                    <Input
                      defaultValue={value}
                      placeholder="xxx"
                      onChange={(e) =>
                        handleChangeParam(name, index, e.target.value, false)
                      }
                    ></Input>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveParam(name, key)}
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
                onClick={() => hanldeAddParam(name)}
              >
                <AddIcon className="size-4" />
              </Button>
              <div>
                <Button
                  className="mt-1"
                  variant="secondary"
                  onClick={() => handleReset(name, param)}
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
              onSubmit(searchParamsMap);
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
