export const DUMMY_units =
[
  {
    unit_identifier: 'DOT-12',
    unit_type: "Platform",
    unit_name: "Black Pacifica",
    unit_topics: [{
      category: 'sample 1',
      topics: [{
        name: 'sample_topic_1'
      }],
    },
    {
      category: 'sample 2',
      topics: [{
        name: 'sample_topic_3'
      }, {
        name: 'sample_topic_2'
      }],
    }]
  },
  {
    unit_identifier: 'DOT-13',
    unit_type: "Platform",
    unit_name: "White Pacifica",
    unit_topics: [{
      category: 'sample 1',
      topics: [{
        name: 'sample_topic_1'
      }],
    },
    {
      category: 'sample 2',
      topics: [{
        name: 'sample_topic_2'
      }],
    }]
  },
  {
    unit_identifier: 'streets_id',
    unit_type: "Infrastructure",
    unit_name: "West Intersection",
    unit_topics: [{
      category: 'sample 1',
      topics: [{
        name: 'sample_topic_1'
      }],
    },
    {
      category: 'sample 2',
      topics: [{
        name: 'sample_topic_2'
      }],
    }]
  }
];

export const DEFAULT_TOPIC_CATEGORY_NAME="Default";

export const NOTIFICATION_STATUS={
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}