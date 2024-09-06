interface SearchEngineMap {
  [key: string]: SearchEngineParam;
}

interface SearchEngineParam {
  url: string;
  selected?: boolean;
  icon: any;
  ref: any;
}

interface SearchEngineMenuItem {
  name: EngineName;
  icon: (_) => JSX.Element;
}

interface SearchEngine {
  key: number;
  name: EngineName;
  url: string;
  icon: (_: IconProps) => JSX.Element;
  ref?: React.RefObject<ImperativePanelHandle>;
}

type UrlParamsMap = { [key: number]: string[][] };
