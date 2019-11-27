const axios = require('axios');
const htmlParser = require('html-parser')
const stemmer = require('./StemmerClass')
const request = require('request');

class Parser {
  constructor(link) {
    this.lines = []
    this.link = link
    this.lang = ''
  }
  parse() {
    let lang = ''
    let dataObject = {}
    let promise = new Promise((resolve, reject) => {
      axios.get(encodeURI(this.link)).then((response) => {
        lang = response.headers['content-language']
        console.log(lang)
        htmlParser.parse(response.data, {
          text: (value) => {
            if (lang === 'ru') {
              value = value.replace(/[^а-яА-Я ]/g, "")
              dataObject.lang = 'ru'
              if (value.trim()) {
                value = this.splitString(value)
                this.lines = this.lines.concat(value)
                dataObject.data = this.lines
              }
            } else {
              value = value.replace(/[^a-zA-Z ]/g, "")
              dataObject.lang = 'en'
              if (value.trim()) {
                value = this.splitString(value)
                value = this.getBase(value)
                this.lines = this.lines.concat(value)
                dataObject.data = this.lines
              }
            }
          }
        })
        resolve(dataObject)
      })
    })

    return promise
  }

  splitString(string) {
    return string.replace(/\s+/g, " ").trim().split(" ");
  }

  getBase(array) {
    return array.map((item) => `${item} - ${stemmer(item)} - ${this.getWordCount(array, item)}`)
  }

  getWordCount(arr, word) {
    let counter = 0
    arr.forEach((item) => {
      if (item === word) {
        counter ++
      }
    })
    return counter
  }
}
module.exports = Parser
