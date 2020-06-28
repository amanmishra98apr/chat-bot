const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');


const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class MakeReservationDialog extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('makeReservationDialog');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [

    this.getName.bind(this),    // Get name from user
    this.getNumberOfParticipants.bind(this),  // Number of participants for reservation
    
    this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
           
]));




this.initialDialogId = WATERFALL_DIALOG;


   }

   async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
    }
}



async getName(step){
    endDialog = false;
    console.log(step.result+"from make r dialog");
    
    return await step.prompt(TEXT_PROMPT, 'what is your name?');
    
    

}

async getNumberOfParticipants(step){
     
    step.values.name = step.result
    return await step.prompt(NUMBER_PROMPT, 'what is your age?');
}


async confirmStep(step){

    step.values.noOfParticipants = step.result

    var msg = ` You have entered following values: \n Your Name: ${step.values.name}\n Your Age: ${step.values.noOfParticipants}\n `

    await step.context.sendActivity(msg);
    endDialog = true;
    return await step.prompt(TEXT_PROMPT, 'Thank! You');
}






async isDialogComplete(){
    return endDialog;
}
}

module.exports.MakeReservationDialog = MakeReservationDialog;







