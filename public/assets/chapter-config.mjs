// Source-linked scenic choreography; repair-1/motion-plan.json.
export const chapters={
  "opening": {
    "entry": {
      "selector": "#slide-opening [data-entry=\"subject\"]",
      "from": [
        96,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 520,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-opening [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        48,
        0
      ],
      "durationMs": 4000,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -72,
        -16
      ],
      [
        -28,
        22
      ],
      [
        20,
        0
      ]
    ],
    "palette": [
      "#201b1b",
      "#ffad91"
    ],
    "ambient": {
      "selector": "#slide-opening [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        70,
        -30
      ],
      "durationMs": 15000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          -100,
          50
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          80,
          -50
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          120,
          60
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "overview": {
    "entry": {
      "selector": "#slide-overview [data-entry=\"subject\"]",
      "from": [
        0,
        64
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 460,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-overview [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        36
      ],
      "durationMs": 3600,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        68,
        0
      ],
      [
        0,
        -52
      ],
      [
        -24,
        12
      ]
    ],
    "palette": [
      "#201b1b",
      "#ffad91"
    ],
    "ambient": {
      "selector": "#slide-overview [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        90,
        0
      ],
      "durationMs": 18000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          50
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          0,
          70
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          90,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "bluecode": {
    "entry": {
      "selector": "#slide-bluecode [data-entry=\"subject\"]",
      "from": [
        100,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 520,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-bluecode [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        56,
        0
      ],
      "durationMs": 3200,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -80,
        0
      ],
      [
        -28,
        36
      ],
      [
        22,
        -12
      ]
    ],
    "palette": [
      "#0b1828",
      "#b8e6f8"
    ],
    "ambient": {
      "selector": "#slide-bluecode [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        100,
        -45
      ],
      "durationMs": 15000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          80,
          100
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          140,
          -60
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          -160,
          90
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "aurora": {
    "entry": {
      "selector": "#slide-aurora [data-entry=\"subject\"]",
      "from": [
        -92,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 500,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-aurora [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        100,
        0
      ],
      "durationMs": 3600,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        76,
        0
      ],
      [
        -32,
        44
      ],
      [
        18,
        -14
      ]
    ],
    "palette": [
      "#231c16",
      "#f6b96b"
    ],
    "ambient": {
      "selector": "#slide-aurora [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        125,
        0
      ],
      "durationMs": 13000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          -160,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -100,
          50
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          180,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "ultron": {
    "entry": {
      "selector": "#slide-ultron [data-entry=\"subject\"]",
      "from": [
        88,
        44
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 540,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-ultron [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        50,
        30
      ],
      "durationMs": 4000,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        68,
        -40
      ],
      [
        -60,
        36
      ],
      [
        24,
        10
      ]
    ],
    "palette": [
      "#191725",
      "#c5bcff"
    ],
    "ambient": {
      "selector": "#slide-ultron [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        -35,
        65
      ],
      "durationMs": 13000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          100,
          -80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          160,
          70
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          -120,
          100
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "daria": {
    "entry": {
      "selector": "#slide-daria [data-entry=\"subject\"]",
      "from": [
        -80,
        32
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 480,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-daria [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        -65
      ],
      "durationMs": 4000,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -64,
        28
      ],
      [
        40,
        -32
      ],
      [
        18,
        12
      ]
    ],
    "palette": [
      "#271a22",
      "#e9a8cc"
    ],
    "ambient": {
      "selector": "#slide-daria [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        40,
        -80
      ],
      "durationMs": 15000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          -90,
          80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -150,
          40
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          120,
          90
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "lisa": {
    "entry": {
      "selector": "#slide-lisa [data-entry=\"subject\"]",
      "from": [
        0,
        80
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 520,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-lisa [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        48
      ],
      "durationMs": 3000,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        72,
        0
      ],
      [
        0,
        56
      ],
      [
        -24,
        -12
      ]
    ],
    "palette": [
      "#132522",
      "#a2dac0"
    ],
    "ambient": {
      "selector": "#slide-lisa [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        -90,
        0
      ],
      "durationMs": 16000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          100
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          140,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          -120,
          80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "victoria": {
    "entry": {
      "selector": "#slide-victoria [data-entry=\"subject\"]",
      "from": [
        84,
        -40
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 500,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-victoria [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        55,
        -45
      ],
      "durationMs": 4300,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        64,
        -40
      ],
      [
        -48,
        44
      ],
      [
        20,
        12
      ]
    ],
    "palette": [
      "#211b1b",
      "#ffad91"
    ],
    "ambient": {
      "selector": "#slide-victoria [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        75,
        -45
      ],
      "durationMs": 14000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          -130
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          140,
          -80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          -160,
          100
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "openrolera": {
    "entry": {
      "selector": "#slide-openrolera [data-entry=\"subject\"]",
      "from": [
        -100,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 520,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-openrolera [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        100,
        0
      ],
      "durationMs": 4400,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -76,
        0
      ],
      [
        44,
        36
      ],
      [
        18,
        -10
      ]
    ],
    "palette": [
      "#202214",
      "#d6dd91"
    ],
    "ambient": {
      "selector": "#slide-openrolera [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        100,
        0
      ],
      "durationMs": 14000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -150,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          130,
          100
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "iris": {
    "entry": {
      "selector": "#slide-iris [data-entry=\"subject\"]",
      "from": [
        96,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 500,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-iris [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        110,
        0
      ],
      "durationMs": 3600,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        80,
        0
      ],
      [
        -36,
        -44
      ],
      [
        22,
        12
      ]
    ],
    "palette": [
      "#281c2c",
      "#e6b5ef"
    ],
    "ambient": {
      "selector": "#slide-iris [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        140,
        0
      ],
      "durationMs": 13000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          -180,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -130,
          -50
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          120,
          60
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "andrea": {
    "entry": {
      "selector": "#slide-andrea [data-entry=\"subject\"]",
      "from": [
        0,
        72
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 480,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-andrea [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        95
      ],
      "durationMs": 4500,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -64,
        -28
      ],
      [
        48,
        36
      ],
      [
        20,
        10
      ]
    ],
    "palette": [
      "#16252c",
      "#9bd4e7"
    ],
    "ambient": {
      "selector": "#slide-andrea [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        70
      ],
      "durationMs": 13000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          90
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -140,
          50
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          0,
          130
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "vision": {
    "entry": {
      "selector": "#slide-vision [data-entry=\"subject\"]",
      "from": [
        72,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 480,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-vision [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        52,
        0
      ],
      "durationMs": 3000,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -72,
        0
      ],
      [
        0,
        48
      ],
      [
        22,
        -12
      ]
    ],
    "palette": [
      "#171d1c",
      "#c1d98e"
    ],
    "ambient": {
      "selector": "#slide-vision [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        96,
        24
      ],
      "durationMs": 18000,
      "ease": "none",
      "yoyo": true
    }
  },
  "inference": {
    "entry": {
      "selector": "#slide-inference [data-entry=\"subject\"]",
      "from": [
        -92,
        32
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 520,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-inference [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        56,
        0
      ],
      "durationMs": 3200,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        76,
        -32
      ],
      [
        -56,
        40
      ],
      [
        18,
        14
      ]
    ],
    "palette": [
      "#20232a",
      "#a8c1f5"
    ],
    "ambient": {
      "selector": "#slide-inference [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        96,
        24
      ],
      "durationMs": 18000,
      "ease": "none",
      "yoyo": true
    }
  },
  "amaia": {
    "entry": {
      "selector": "#slide-amaia [data-entry=\"subject\"]",
      "from": [
        80,
        -48
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 500,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-amaia [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        35,
        -70
      ],
      "durationMs": 4500,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        64,
        -40
      ],
      [
        -44,
        48
      ],
      [
        20,
        10
      ]
    ],
    "palette": [
      "#2a191b",
      "#e8afb5"
    ],
    "ambient": {
      "selector": "#slide-amaia [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        60,
        -90
      ],
      "durationMs": 15000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          -90,
          -80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -130,
          70
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          60,
          160
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "sara": {
    "entry": {
      "selector": "#slide-sara [data-entry=\"subject\"]",
      "from": [
        -96,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 480,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-sara [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        210
      ],
      "durationMs": 5200,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -80,
        0
      ],
      [
        44,
        -36
      ],
      [
        20,
        12
      ]
    ],
    "palette": [
      "#102c2c",
      "#9cdcd6"
    ],
    "ambient": {
      "selector": "#slide-sara [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        0,
        160
      ],
      "durationMs": 14000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          100
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          130,
          70
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          0,
          -150
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "ora": {
    "entry": {
      "selector": "#slide-ora [data-entry=\"subject\"]",
      "from": [
        88,
        0
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 460,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-ora [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        90,
        0
      ],
      "durationMs": 4200,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        68,
        0
      ],
      [
        0,
        -56
      ],
      [
        -24,
        12
      ]
    ],
    "palette": [
      "#242020",
      "#e7c68e"
    ],
    "ambient": {
      "selector": "#slide-ora [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        110,
        -30
      ],
      "durationMs": 15000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          150,
          -80
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          160,
          90
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          -120,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "iria": {
    "entry": {
      "selector": "#slide-iria [data-entry=\"subject\"]",
      "from": [
        -84,
        40
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 500,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-iria [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        60,
        -35
      ],
      "durationMs": 4400,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -72,
        -24
      ],
      [
        52,
        40
      ],
      [
        20,
        12
      ]
    ],
    "palette": [
      "#191f30",
      "#b8cef1"
    ],
    "ambient": {
      "selector": "#slide-iria [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        -90,
        50
      ],
      "durationMs": 14000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          -120,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          -130,
          70
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          140,
          90
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  },
  "closing": {
    "entry": {
      "selector": "#slide-closing [data-entry=\"subject\"]",
      "from": [
        0,
        64
      ],
      "to": [
        0,
        0
      ],
      "delayMs": 70,
      "durationMs": 460,
      "ease": "power3.out"
    },
    "idle": {
      "selector": "#slide-closing [data-motion=\"idle\"]",
      "from": [
        0,
        0
      ],
      "to": [
        48,
        0
      ],
      "durationMs": 4000,
      "ease": "none",
      "yoyo": true
    },
    "vectors": [
      [
        -64,
        20
      ],
      [
        -24,
        -36
      ],
      [
        20,
        10
      ]
    ],
    "palette": [
      "#201b1b",
      "#ffad91"
    ],
    "ambient": {
      "selector": "#slide-closing [data-motion=\"ambient\"]",
      "from": [
        0,
        0
      ],
      "to": [
        100,
        -40
      ],
      "durationMs": 18000,
      "ease": "none",
      "yoyo": true
    },
    "assembly": [
      {
        "layer": "backplane",
        "from": [
          0,
          70
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 0,
        "durationMs": 430,
        "ease": "power3.out"
      },
      {
        "layer": "midground",
        "from": [
          110,
          0
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 65,
        "durationMs": 475,
        "ease": "power3.out"
      },
      {
        "layer": "foreground",
        "from": [
          0,
          90
        ],
        "to": [
          0,
          0
        ],
        "delayMs": 130,
        "durationMs": 520,
        "ease": "power3.out"
      }
    ]
  }
};
