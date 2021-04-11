const DICTIONARY_API_URI = "https://api.dictionaryapi.dev";

const languageList = [
  { languageCode: "en_US", language: "English (US)" },
  { languageCode: "hi", language: "Hindi" },
  { languageCode: "es", language: "Spanish" },
  { languageCode: "fr", language: "French" },
  { languageCode: "ja", language: "Japanese" },
  { languageCode: "ru", language: "Russian" },
  { languageCode: "en_GB", language: "English (UK)" },
  { languageCode: "de", language: "German" },
  { languageCode: "it", language: "Italian" },
  { languageCode: "ko", language: "Korean" },
  { languageCode: "pt-BR", language: "Brazilian Portuguese" },
  { languageCode: "ar", language: "Arabic" },
  { languageCode: "tr", language: "Turkish" },
];

class HTMLBuilder {
  static generateLanguageOptions() {
    languageList.forEach(item => {
      $("#information-input-wrapper #information__language").append(
        `<option value="${item.languageCode}">${item.language}</option>`
      );
    });
  }

  static generateWords(information) {
    const { word } = information[0];
    HTMLBuilder._setWordResult(word);
  }

  static generatePhonetics(information) {
    const { phonetics } = information[0];
    HTMLBuilder._setPhoneticsContent(phonetics);
  }

  static generateMeanings(information) {
    const { meanings } = information[0];
    HTMLBuilder._setMeaningsContent(meanings);
  }

  static _setWordResult(word) {
    $("#information-result-content-wrapper .word-result").text(word);
  }

  static _resetPhoneticsContent(phonetics) {
    if(phonetics.length > 0) {
      $("#information-result-content-wrapper [data-result='phonetics']")
        .html(`<p class="single-result-title">Phonetics</p>`)
        .removeClass("disabled");
    } else {
      $("#information-result-content-wrapper [data-result='phonetics']")
        .html("")
        .addClass("disabled");
    }
  }

  static _setPhoneticsContent(phonetics) {
    HTMLBuilder._resetPhoneticsContent(phonetics);
    
    phonetics.forEach(item => {
      $("#information-result-content-wrapper [data-result='phonetics']")
        .append(
          `
            <div class="single-result-inner-box col-md-6">
              <div class="single-result-inner-box-text-wrapper">
                <span class="single-result-inner-box-text">Text: </span>
                <span span class="single-result-inner-box-value">${item.text}</span>
              </div>
              <audio
                class="single-result-inner-box-audio"
                src="${item.audio}"
                controls
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          `
        );
    });
  }

  static _resetMeaningsContent(meanings) {
    if(meanings.length > 0) {
      $("#information-result-content-wrapper [data-result='meanings']")
        .html(`<p class="single-result-title">Meanings</p>`)
        .removeClass("disabled");
    } else {
      $("#information-result-content-wrapper [data-result='meanings']")
        .html("")
        .addClass("disabled");
    }
  }

  static _setMeaningsContent(meanings) {
    HTMLBuilder._resetMeaningsContent(meanings);

    const meaningsWrapper = $("#information-result-content-wrapper [data-result='meanings']");

    meanings.forEach(({ partOfSpeech, definitions }) => {
      const partOfSpeechContent = `
        <span span class="single-result-part-of-speech">${partOfSpeech}</span>
      `;

      let definitionsWrapper = `
        <div class="single-result-definitions-wrapper">
      `;

      definitions.forEach(item => {
        let definitionsContent = `
          <div class="single-result-definitions-content">
        `;

        Object.entries(item).forEach(([key, value]) => {
          definitionsContent += `
            <p class="single-result-inner-definition">
              <span class="single-result-inner-definition-text">${key}</span>
              <span class="single-result-inner-definition-value">${Array.isArray(value) ? value.join(", ") : value}</span>
            </p>
          `;
        });

        definitionsContent += "</div>";
        definitionsWrapper += definitionsContent;
      });

      definitionsWrapper += "</div>";

      meaningsWrapper.append(
        `
          <div class="single-result-inner-box-wrapper">
            ${partOfSpeechContent}
            ${definitionsWrapper}
          </div>
        `
      );
    });
  }
}

$(document).ready(function() {
  HTMLBuilder.generateLanguageOptions();

  $("#header .get-started-button").on("click", () => {
    $('body,html').animate({ scrollTop: $('body').height() }, 1200);
  });

  $("#information-form .submit-button").on("click", async (event) => {
    event.preventDefault();

    const word = $("#information__word").val();
    const language = $("#information__language").val();

    if(word === "") {
      swal("Oops!", "Word is required", "warning");
      return;
    }

    if(language === null) {
      swal("Oops!", "Language must be selected", "warning");
      return;
    }

    try {
      const information = await axios.get(
        `${DICTIONARY_API_URI}/api/v2/entries/${language}/${word}`
      );
  
      HTMLBuilder.generateWords(information.data);
      HTMLBuilder.generatePhonetics(information.data);
      HTMLBuilder.generateMeanings(information.data);

      $("#information-result-content-wrapper").removeClass("disabled");
    } catch (e) {
      if(e.response) {
        swal("Oops!", e.response.data.title || "Internal Server Error", "warning");
      }
    }
  });
});