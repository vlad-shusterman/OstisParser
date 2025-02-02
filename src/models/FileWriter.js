const fs = require('fs')

class FileWriter {
  constructor (file, data) {
    this.file = file
    this.data = data
  }

  writeData() {
    const file = fs.createWriteStream(this.file)
    file.on('error', function(err) { /* error handling */ });
    fs.writeFileSync(this.file, JSON.stringify(this.data))
    file.end();
  }

  getFile() {
    let str = `
    concept_series -> Hannibal;;

Hannibal
<- sc_node_not_relation;
=> nrel_main_idtf:
	[Ганнибал]
	(* <- lang_ru;;	*);
	[Hannibal]
	(* <- lang_en;;	*);;

Hannibal <-rrel_key_sc_element:...
(*
	<-definition;;
	=>nrel_main_idtf:
		[Описание (Ганнибал)](*<-lang_ru;;*);
		[Description (Hannibal)](*<-lang_en;;*);;
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
		[Pic. ( Hannibal)](*<-lang_en;;*);;
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


Hannibal  => nrel_actor : Mads_Mikkelsen;;
Hannibal  => nrel_actor : Hugh_Dancy;;

Hannibal
=>nrel_keywords: concept_detectif;;
    `
  }
}

module.exports = FileWriter
