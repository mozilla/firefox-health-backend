const TELEMETRY_CONFIG = {
  winOpen: {
    channel: 'nightly',
    metric: 'FX_NEW_WINDOW_MS',
    useSubmissionDate: false,
    evoVersions: '5',
    filters: {
      application: 'Firefox',
    },
  },
  tabSwitch: {
    channel: 'nightly',
    metric: 'FX_TAB_SWITCH_TOTAL_E10S_MS',
    evoVersions: '5',
    filters: {
      application: 'Firefox',
    },
  },
  tabClose: {
    channel: 'nightly',
    metric: 'FX_TAB_CLOSE_TIME_ANIM_MS',
    evoVersions: '5',
    filters: {
      application: 'Firefox',
    },
  },
  firstPaint: {
    channel: 'nightly',
    metric: 'SIMPLE_MEASURES_FIRSTPAINT',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  blankWindowShown: {
    channel: 'nightly',
    metric: 'SIMPLE_MEASURES_BLANKWINDOWSHOWN',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  sessionRestoreWindow: {
    channel: 'nightly',
    metric: 'FX_SESSION_RESTORE_RESTORE_WINDOW_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  sessionRestoreStartupInit: {
    channel: 'nightly',
    metric: 'FX_SESSION_RESTORE_STARTUP_INIT_SESSION_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  sessionRestoreStartupOnload: {
    channel: 'nightly',
    metric: 'FX_SESSION_RESTORE_STARTUP_ONLOAD_INITIAL_WINDOW_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  tabSwitchUpdate: {
    channel: 'nightly',
    metric: 'FX_TAB_SWITCH_UPDATE_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  gcAnimation: {
    channel: 'nightly',
    metric: 'GC_ANIMATION_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  gpuProcessInit: {
    channel: 'nightly',
    metric: 'GPU_PROCESS_INITIALIZATION_TIME_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  gpuProcessLaunch: {
    channel: 'nightly',
    metric: 'GPU_PROCESS_LAUNCH_TIME_MS_2',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  inputEventCoalesced: {
    channel: 'nightly',
    metric: 'INPUT_EVENT_RESPONSE_COALESCED_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  networkCacheHit: {
    channel: 'nightly',
    metric: 'NETWORK_CACHE_V2_HIT_TIME_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  networkCacheMiss: {
    channel: 'nightly',
    metric: 'NETWORK_CACHE_V2_MISS_TIME_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  placesAutocomplete: {
    channel: 'nightly',
    metric: 'PLACES_AUTOCOMPLETE_6_FIRST_RESULTS_TIME_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  searchServiceInit: {
    channel: 'nightly',
    metric: 'SEARCH_SERVICE_INIT_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToDomComplete: {
    channel: 'nightly',
    metric: 'TIME_TO_DOM_COMPLETE_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToDomInteractive: {
    channel: 'nightly',
    metric: 'TIME_TO_DOM_INTERACTIVE_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToDomLoading: {
    channel: 'nightly',
    metric: 'TIME_TO_DOM_LOADING_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToFirstInteraction: {
    channel: 'nightly',
    metric: 'TIME_TO_FIRST_INTERACTION_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToNonBlankPaint: {
    channel: 'nightly',
    metric: 'TIME_TO_FIRST_INTERACTION_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToResponseStart: {
    channel: 'nightly',
    metric: 'TIME_TO_RESPONSE_START_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  webextBackgroundPageLoad: {
    channel: 'nightly',
    metric: 'WEBEXT_BACKGROUND_PAGE_LOAD_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  webextContentScriptInjection: {
    channel: 'nightly',
    metric: 'WEBEXT_CONTENT_SCRIPT_INJECTION_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  webextExtensionStartup: {
    channel: 'nightly',
    metric: 'WEBEXT_EXTENSION_STARTUP_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToLoadEventEnd: {
    channel: 'nightly',
    metric: 'TIME_TO_LOAD_EVENT_END_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToDomContentLoadedEnd: {
    channel: 'nightly',
    metric: 'TIME_TO_DOM_CONTENT_LOADED_END_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  contentPaintTime: {
    channel: 'nightly',
    metric: 'CONTENT_PAINT_TIME',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  pageLoad: {
    channel: 'nightly',
    metric: 'FX_PAGE_LOAD_MS',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  simpleSessionRestored: {
    channel: 'nightly',
    metric: 'SIMPLE_MEASURES_SESSIONRESTORED',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  scalarFirstPaint: {
    channel: 'nightly',
    metric: 'SCALARS_TIMESTAMPS.FIRST_PAINT',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
  timeToFirstScroll: {
    channel: 'nightly',
    metric: 'TIME_TO_FIRST_SCROLL',
    evoVersions: '5',
    filters: {
      child: 'parent',
      application: 'Firefox',
    },
  },
};

export default TELEMETRY_CONFIG;
