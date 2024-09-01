interface SearchEngineMap {
  [key: string]: SearchEngineParam;
}

interface SearchEngineParam {
  url: string;
  selected?: boolean;
  icon: any;
  ref: any;
}
