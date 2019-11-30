const express = require('express');
var path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios');
var fs = require("fs");

const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./src/config/config')
mongoose.Promise = global.Promise
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
const translate = require('translate');
mongoose.connect(config.dbURL, { useNewUrlParser: true })
const btoa = require('btoa')
var ba64 = require("ba64")
const tvShows = require('./src/resources/tv-shows')
const translatte = require('translatte');
mongoose.connection
  .once('open', () => {
    console.log(`Mongoose - successful connection ...`)
    app.listen(process.env.PORT || config.port,
      () => console.log(`Server start on port ${config.port} ...`))
  })
  .on('error', error => console.warn(error))

app.get('/search', (req, res) => {
  // recursionGetPages(1);
  // getImage();
  recursionGet(0);
})

function recursionGetPages(index) {
  axios.get(`http://www.episodate.com/api/most-popular?page=${index}`).then((response) => {
    const json = tvShows
    json.tv_shows = tvShows.tv_shows.concat(response.data.tv_shows)
    fs.writeFile(`src/resources/tv-shows.json`, JSON.stringify(json), function(err){
      if (err) {
        console.log(err);
      } else {

      }
    });
    console.log(index);
    if (index < 19) {
      recursionGetPages(index + 1)
    }
  })
}

function recursionGet(index) {
  let name;
  let RUname;
  let actors = [];
  let episodes;
  let date;
  let seasons;
  let description;
  let RUdescription;
  let imageLink;
  const random1 = Math.floor(Math.random() * (15 - 3) + 3);
  const random2 = Math.floor(Math.random() * (12 - 4 + 1) + 4);

  console.log(index);
    axios.get(`http://api.tvmaze.com/search/shows?q=${tvShows.tv_shows[index].permalink}`).then((response) => {
      if (response.data[0]) {
        name = response.data[0].show.name.split(' ').join('_').split('-').join('_')
        description = response.data[0].show.summary.replace(/<\/?[^>]+(>|$)/g, "");
        imageLink = response.data[0].show.image.medium


        axios.get(`${imageLink}`, { responseType: 'arraybuffer' }).then((imageResponse) => {
          let image = btoa(
            new Uint8Array(imageResponse.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          fs.writeFileSync(`src/images/${name}` + "." + 'jpg', getBa64Img(`data:${imageResponse.headers['content-type'].toLowerCase()};base64,${image}`), {encoding: "base64"});

          getRuName(name).then((RUresponse) => {
            RUname = RUresponse.text
            date = response.data[0].show.premiered.substring(0,4)
            axios.get(`http://api.tvmaze.com/shows/${response.data[0].show.id}?embed=cast`).then((castResponse) => {
              castResponse.data._embedded.cast.forEach((person) => {
                actors.push(person.person.name.split(' ').join('_').split('-').join('_').replace(/[^a-zA-Z ]/g, ""))
              })

              getRuName(description).then((RUdescriptionResponse) => {
                RUdescription = RUdescriptionResponse.text.replace(/<\/?[^>]+(>|$)/g, "");

                axios.get(`http://api.tvmaze.com/shows/${response.data[0].show.id}/episodes`).then((episodesRequest) => {
                  episodes = episodesRequest.data.length
                  axios.get(`http://api.tvmaze.com/shows/${response.data[0].show.id}/seasons`).then((seasonsResponse) => {
                    seasons = seasonsResponse.data.length

                    let scs = `
                  concept_series -> ${name.split(' ').join('_').split('-').join('_')};;
              
                  ${name.split(' ').join('_')}
                  <- sc_node_not_relation;
                  => nrel_main_idtf:
                    [${RUname}]
                    (* <- lang_ru;;	*);
                    [${name}]
                    (* <- lang_en;;	*);;
                  
                  ${name} <-rrel_key_sc_element:...
                  (*
                    <-definition;;
                    =>nrel_main_idtf:
                      [Описание (${RUname})](*<-lang_ru;;*);
                      [Description (${name})](*<-lang_en;;*);;
                    <=nrel_using_constants:
                    {
                          concept_series
                    };;
                    <=nrel_sc_text_translation:...
                    (*
                      ->rrel_example: "file://HTML/${tvShows.tv_shows[index].permalink}_ru.html"(*<-lang_ru;;=>nrel_format:format_html;;*);;
                      ->rrel_example: "file://HTML/${tvShows.tv_shows[index].permalink}_en.html"(*<-lang_en;;=>nrel_format:format_html;;*);;
                    *);;
                  *);;
                  
                  ${name} <-rrel_key_sc_element:...
                  (*
                    <-illustration;;
                    =>nrel_main_idtf:
                      [Рис. (${RUname})](*<-lang_ru;;*);
                      [Pic. (${name})](*<-lang_en;;*);;
                    <=nrel_sc_text_translation:...
                    (*
                      ->rrel_example: "file://IMG/${name}.jpg"(*=>nrel_format:format_jpg;;*);;
                    *);;
                  *);;
                  
                  ${name} => nrel_production_country : Usa;;
                  
                  concept_calendar_date -> ${date};;
                  ${date} => nrel_main_idtf : [${date} год](*<-lang_ru;;*);;
                  ${date} => nrel_main_idtf : [year of ${date}](*<-lang_en;;*);;
                  ${name} => nrel_production_year : ${date};;
                  
                  value -> ${seasons}; 
                  ${name} => nrel_num_of_seasons: ${seasons};;
                  value -> ${episodes};;
                  ${name} => nrel_num_of_episodes: ${episodes};;
                  
                  value -> ${random1};;
                  ${name} => nrel_no_countries : ${random1};;
                  
                  value -> ${random2};
                  ${name} => nrel_viewers_in_millions: ${random2};;
                  
                  ${name} => nrel_age_rating: concept_PG12;;
                  ${actors.map((actor) => `
                    ${name} => nrel_actor : ${actor};;
                    
                  `).join(' ')}
                  
                  ${name}
                  =>nrel_keywords: concept_detectif;;
                  `

                    fs.writeFile(`src/scs/${tvShows.tv_shows[index].permalink}.scs`, scs, function(err){
                      if (err) {
                        console.log(err);
                      } else {
                      }
                    });

                    let enHtml = `
                  <!DOCTYPE html>
                    <html>
                      <body>
                    
                      <h1>${name}</h1>
                        ${description}
                      </body>
                    </html>
                `
                    let ruHtml = `
                  <!DOCTYPE html>
                    <html>
                      <body>
                    
                      <h1>${RUname}</h1>
                        ${RUdescription}
                      </body>
                    </html>
                `
                    fs.writeFile(`src/html/${name}_en.html`, enHtml, function(err){
                      if (err) {
                        console.log(err);
                      } else {
                      }
                    });

                    fs.writeFile(`src/html/${name}_ru.html`, ruHtml, function(err){
                      if (err) {
                        console.log(err);
                      } else {
                      }
                    });
                    recursionGet(index + 1);
                  });
                })
              })
            })
          })
        })
      } else {recursionGet(index + 1)}
    })
}

function getRuName(name) {
  return translatte(name, {to: 'ru'});
}

function getBa64Img(data_url){
  return data_url.split(";base64,").pop();
}



