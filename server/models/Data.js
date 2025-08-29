import mongoose from "mongoose"

const dataSchema = new mongoose.Schema({
  end_year: {
    type: String,
    default: ""
  },
  intensity: {
    type: Number,
    default: null
  },
  sector: {
    type: String,
    default: ""
  },
  topic: {
    type: String,
    default: ""
  },
  insight: {
    type: String,
    default: ""
  },
  url: {
    type: String,
    default: ""
  },
  region: {
    type: String,
    default: ""
  },
  start_year: {
    type: String,
    default: ""
  },
  impact: {
    type: Number,
    default: null
  },
  added: {
    type: String,
    default: ""
  },
  published: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  relevance: {
    type: Number,
    default: null
  },
  pestle: {
    type: String,
    default: ""
  },
  source: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  likelihood: {
    type: Number,
    default: null
  },
  city: {
    type: String,
    default: ""
  },
  swot: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
})

const Data = mongoose.model("Data", dataSchema)

export default Data