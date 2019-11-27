const express = require('express');
var path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios');

const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./src/config/config')
mongoose.Promise = global.Promise
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

mongoose.connect(config.dbURL, { useNewUrlParser: true })


const tvShows = require('./src/resources/tv-shows')


mongoose.connection
  .once('open', () => {
    console.log(`Mongoose - successful connection ...`)
    app.listen(process.env.PORT || config.port,
      () => console.log(`Server start on port ${config.port} ...`))
  })
  .on('error', error => console.warn(error))

app.get('/search', (req, res) => {
  recursionGet(0);
})

function recursionGet(index) {
  var fs = require("fs");
  let name;
  let actors = [];
    axios.get(`http://api.tvmaze.com/search/shows?q=${tvShows.tv_shows[index].permalink}`).then((response) => {
      if (response.data[0]) {
        name = response.data[0].show.name
        axios.get(`http://api.tvmaze.com/shows/${response.data[0].show.id}?embed=cast`).then((castResponse) => {
          castResponse.data._embedded.cast.forEach((person) => {
            actors.push(person.person.name.replace(' ', '_'))
          })

          let scs = `
    concept_series -> Hannibal;;

    Hannibal
    <- sc_node_not_relation;
    => nrel_main_idtf:
      [Ганнибал]
      (* <- lang_ru;;	*);
      [${name}]
      (* <- lang_en;;	*);;
    
    Hannibal <-rrel_key_sc_element:...
    (*
      <-definition;;
      =>nrel_main_idtf:
        [Описание (Ганнибал)](*<-lang_ru;;*);
        [Description (${name})](*<-lang_en;;*);;
      <=nrel_using_constants:
      {
            concept_series
      };;
      <=nrel_sc_text_translation:...
      (*
        ->rrel_example: "file://HTML/Hannibal_ru.html"(*<-lang_ru;;=>nrel_format:format_html;;*);;
        ->rrel_example: "file://HTML/Hannibal_en.html"(*<-lang_en;;=>nrel_format:format_html;;*);;
      *);;
    *);;
    
    Hannibal <-rrel_key_sc_element:...
    (*
      <-illustration;;
      =>nrel_main_idtf:
        [Рис. (Ганнибал)](*<-lang_ru;;*);
        [Pic. (${name})](*<-lang_en;;*);;
      <=nrel_sc_text_translation:...
      (*
        ->rrel_example: "file://IMG/Hannibal.jpg"(*=>nrel_format:format_jpg;;*);;
      *);;
    *);;
    
    Hannibal => nrel_production_country : Usa;;
    
    concept_calendar_date -> 2013;;
    2013 => nrel_main_idtf : [2013 год](*<-lang_ru;;*);;
    2013 => nrel_main_idtf : [year of 2013](*<-lang_en;;*);;
    Hannibal => nrel_production_year : 2013;;
    
    value -> 3;;
    Hannibal => nrel_num_of_seasons: 3;;
    value -> 39;;
    Hannibal => nrel_num_of_episodes: 39;;
    
    value -> 15;;
    Hannibal => nrel_no_countries : 15;;
    
    value -> 6;;
    Hannibal => nrel_viewers_in_millions: 6;;
    
    Hannibal => nrel_age_rating: concept_PG12;;
    ${actors.map((actor) => `
      ${name} => nrel_actor : ${actor};;
    `.trim()).join('')}
    
    Hannibal
    =>nrel_keywords: concept_detectif;;
    `

          fs.writeFile(`src/scs/${tvShows.tv_shows[index].permalink}.scs`, scs, function(err){
            if (err) {
              console.log(err);
            } else {
            }
          });
          recursionGet(index + 1);
        })
      } else {recursionGet(index + 1)}
    })
}




