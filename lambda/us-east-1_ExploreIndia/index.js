/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const numbers = require('./numbers');
const noAplSpeechText = 'This is a sample that shows places logs. ' +
                        'Try it on an Echo Show, Echo Spot or Fire TV device.'

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Explore India! Say begin to see cool places in India';

    if(supportsAPL(handlerInput))
    {
        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Explore India', speechText)
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./launchRequest.json'),
            datasources: require('./sampleDataSource.json')
        })
        .getResponse();
    }
    else
    {
        return handlerInput.responseBuilder
        .speak(noAplSpeechText)
        .getResponse();
    }
  },
};

const BeginIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'BeginIntent'
        || request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments.length > 0 && request.arguments[0] == "begin";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
          .speak("Here is a list of places in India you can explore.")
          .reprompt("Select any place")
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./listPlaces.json'),
            datasources: require('./sampleDataSource.json')
          })
          .getResponse();
  }
}

const ListItemPressedHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments.length > 0;
  },
  handle(handlerInput) {
    const selectedItem = Number(handlerInput.requestEnvelope.request.arguments[0]);
    return handlerInput.responseBuilder
          .speak(PLACE_DATA[selectedItem].desc)
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./selectedPlace.json'),
            datasources: createPlaceDataSource.call(this, PLACE_DATA[selectedItem].title, PLACE_DATA[selectedItem].imgSrc, PLACE_DATA[selectedItem].desc)
          })
          .getResponse();
  }
}

const GetPlaceByNumberHandler = {
    canHandle: (handlerInput) => {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SelectByNumberIntent';
    },
    handle: (handlerInput) => {
        const slotValue = handlerInput.requestEnvelope.request.intent.slots.ordinal.value || handlerInput.requestEnvelope.request.intent.slots.cardinal.value;

        console.log(`Got Slot number: ${slotValue}`);
        const selectedItem = numbers.ordinalToNumber(slotValue) - 1;
        console.log(`Number resolved to: ${selectedItem}`);

        if(isNaN(selectedItem)) {
            return handlerInput.responseBuilder
                            .speak('Sorry, I didn\'t recognize that place, please try again!')
                            .reprompt('Which place would you like to explore?')
                            .getResponse();
        }

        const numItems = PLACE_DATA.length;
        if(selectedItem > numItems) {
            return handlerInput.responseBuilder
                               .speak('Sorry, I couldn\'t find that place, please say a number between 1 and ' + numItems)
                               .reprompt('Which place would you like to explore?')
                               .getResponse();
        }

        if(supportsAPL(handlerInput))
        {
            return handlerInput.responseBuilder
            .speak(PLACE_DATA[selectedItem].desc)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: require('./selectedPlace.json'),
                datasources: createPlaceDataSource.call(this, PLACE_DATA[selectedItem].title, PLACE_DATA[selectedItem].imgSrc, PLACE_DATA[selectedItem].desc)
            })
            .getResponse();
        }
        else
        {
            return handlerInput.responseBuilder
            .speak(noAplSpeechText)
            .getResponse();
        }
    }
}

const GetPlaceByTitleHandler = {
    canHandle: (handlerInput) => {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'IndianPlacesIntent';
    },
    handle: (handlerInput) => {
        const titleValue = handlerInput.requestEnvelope.request.intent.slots.place.value;
        console.log('placevalue ' + titleValue);

        var selectedItem = 0;
        while(selectedItem < PLACE_DATA.length) {
          if (titleValue == PLACE_DATA[selectedItem].name) {
            break;
          }
        }
        if (selectedItem == PLACE_DATA.length && titleValue != PLACE_DATA[selectedItem].name) {
            return handlerInput.responseBuilder
                            .speak('Sorry, I didn\'t recognize that place, try again!')
                            .reprompt('Which place would you like to explore?')
                            .getResponse();
        }

        if(supportsAPL(handlerInput))
        {
            return handlerInput.responseBuilder
            .speak(PLACE_DATA[selectedItem].desc)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: require('./selectedPlace.json'),
                datasources: createPlaceDataSource.call(this, PLACE_DATA[selectedItem].title, PLACE_DATA[selectedItem].imgSrc, PLACE_DATA[selectedItem].desc)
            })
            .getResponse();
        }
        else
        {
            return handlerInput.responseBuilder
            .speak(noAplSpeechText)
            .getResponse();
        }
    }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can select a place from the list by saying the name of the place or the number!';

    if(supportsAPL(handlerInput))
    {
        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Explore India', speechText)
        .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./launchRequest.json'),
            datasources: require('./sampleDataSource.json')
        })
        .getResponse();
    }
    else
    {
        return handlerInput.responseBuilder
        .speak(noAplSpeechText)
        .getResponse();
    }
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Goodbye!', speechText)
      .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./goodbye.json')
        })
        .addDirective({
              type: "Alexa.Presentation.APL.ExecuteCommands",
              token: "VideoPlayerToken",
              commands: [
                {
                  type: "ControlMedia",
                  componentId: "myVideoPlayer",
                  command: "play"
                }
              ]
            })
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function createPlaceDataSource(title, imgSrc, desc){
  return {
    "bodyTemplate3Data": {
        "type": "object",
        "objectId": "bt3Sample",
        "backgroundImage": {
            "contentDescription": null,
            "smallSourceUrl": null,
            "largeSourceUrl": null,
            "sources": [
                {
                    "url": "https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/-hnnJox/visualization-of-bright-dots-moving-around-a-dark-background_n1l_mmuu__F0000.png",
                    "size": "small",
                    "widthPixels": 0,
                    "heightPixels": 0
                },
                {
                    "url": "https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/-hnnJox/visualization-of-bright-dots-moving-around-a-dark-background_n1l_mmuu__F0000.png",
                    "size": "large",
                    "widthPixels": 0,
                    "heightPixels": 0
                }
            ]
        },
        "title": title,
        "image": {
            "contentDescription": null,
            "smallSourceUrl": null,
            "largeSourceUrl": null,
            "sources": [
                {
                    "url": imgSrc,
                    "size": "small",
                    "widthPixels": 0,
                    "heightPixels": 0
                },
                {
                    "url": imgSrc,
                    "size": "large",
                    "widthPixels": 0,
                    "heightPixels": 0
                }
            ]
        },
        "textContent": {
            "title": {
                "type": "PlainText",
                "text": title,
                "style": "textStyleBody",
                "width": "90vw",
                "textAlign": "center"
            },
            "primaryText": {
                "type": "PlainText",
                "paddingTop": 40,
                "style": "textStylePrimary",
                "width": "90vw",
                "textAlign": "center",
                "text": desc
            }
        }
    }
  }
}

const PLACE_DATA = [
  {
    "name": "delhi",
    "title": "Delhi",
    "imgSrc": "http://www.worldfortravel.com/wp-content/uploads/2015/12/Grand-Red-Fort.jpg",
    "desc": "Delhi, officially the National Capital Territory of Delhi, is a city and a union territory of India. It is bordered by Haryana on three sides and by Uttar Pradesh to the east."
  },
  {
    "name": "udaipur",
    "title": "Udaipur",
    "imgSrc": "https://farm2.staticflickr.com/1580/24313888376_5edb9b82e9_o.jpg",
    "desc": "Udaipur also known as the 'City of Lakes' is a major city, municipal corporation and the administrative headquarters of the Udaipur district in the Indian state of Rajasthan. It is the historic capital of the kingdom of Mewar in the former Rajputana Agency."
  },
  {
    "name": "mumbai",
    "title": "Mumbai",
    "imgSrc": "https://wonderfulengineering.com/wp-content/uploads/2016/01/Mumbai-wallpaper-13.jpg",
    "desc": "Mumbai is the capital city of the Indian state of Maharashtra. It is the most populous city in India with an estimated city proper population of 12.4 million as of 2011. Along with the neighbouring regions of the Mumbai Metropolitan Region, it is the second most populous metropolitan area in India, with a population of 21.3 million."
  },
  {
    "name": "chennai",
    "title": "Chennai",
    "imgSrc": "https://inspirationseek.com/wp-content/uploads/2014/12/Chennai-Hotel-India.jpg",
    "desc": "Chennai is the capital of the Indian state of Tamil Nadu. Located on the Coromandel Coast off the Bay of Bengal, it is one of the biggest cultural, economic and educational centres in South India. According to the 2011 Indian census, it is the sixth-largest city and fourth-most populous urban agglomeration in India."
  },
  {
    "name": "kolkata",
    "title": "Kolkata",
    "imgSrc": "https://im.proptiger.com/6/16/92/kolkata-heroshot-664497.jpeg",
    "desc": "Kolkata is the capital of the Indian state of West Bengal. Located on the east bank of the Hooghly River, it is the principal commercial, cultural, and educational centre of East India, while the Port of Kolkata is India's oldest operating port and its sole major riverine port."
  }
];

function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ListItemPressedHandler,
    GetPlaceByNumberHandler,
    GetPlaceByTitleHandler,
    BeginIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
