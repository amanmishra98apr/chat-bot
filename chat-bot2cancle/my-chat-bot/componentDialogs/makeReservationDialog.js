const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');

const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');


const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class MakeReservationDialog extends ComponentDialog {

    constructor(conservsationState, userState) {
        super('makeReservationDialog');



        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.noOfParticipantsValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT, this.checkDate));


        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
            this.getName.bind(this),    // Get name from user
            this.getNumberOfParticipants.bind(this),  // Number of participants for reservation
            this.getDate.bind(this), // Date of reservation
            this.getTime.bind(this),  // Time of reservation
            this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
            this.summaryStep.bind(this)

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

    async firstStep(step) {
        endDialog = false;
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CONFIRM_PROMPT, 'Would you like to make a reservation?', ['yes', 'no']);

    }

    async getName(step) {

        console.log(step.result + "from make r dialog");
        if (step.result === true) {
            return await step.prompt(TEXT_PROMPT, 'In what name reservation is to be made?');
        }


    }

    async getNumberOfParticipants(step) {

        step.values.name = step.result
        return await step.prompt(NUMBER_PROMPT, 'How many participants ( 1 - 150)?');
    }

    async getDate(step) {

        step.values.noOfParticipants = step.result

        return await step.prompt(DATETIME_PROMPT, 'On which date you want to make the reservation?')
    }

    async getTime(step) {
        step.values.date = step.result
        var date1 = JSON.stringify(step.values.date)
        //console.log("date entered: "+date1[0]) 
        var x;
        for (var i of step.values.date) {
            console.log(i['value']);
            x = i['value']
        }
        console.log(typeof x)
        var date1 = new Date(x)
        //console.log(date1)
        if (date1 >= new Date()) {
            console.log("hii yes")
        }
        return await step.prompt(DATETIME_PROMPT, 'At what time?')
        //return true
    }


    async confirmStep(step) {

        step.values.time = step.result

        var msg = ` You have entered following values: \n Name: ${step.values.name}\n Participants: ${step.values.noOfParticipants}\n Date: ${JSON.stringify(step.values.date[0]['value'])}\n Time: ${JSON.stringify(step.values.time[0]['value'])}`

        await step.context.sendActivity(msg);

        return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all values are correct and you want to make the reservation?', ['yes', 'no']);
    }

    async summaryStep(step) {

        if (step.result === true) {
            // Business 

            await step.context.sendActivity("Reservation successfully made. Your reservation id is : 12345678")
            endDialog = true;
            return await step.endDialog();

        }



    }


    async noOfParticipantsValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        console.log("no of pa")
        console.log(promptContext.recognized.succeeded)
        console.log(promptContext.recognized.value)
        console.log("no of pa end")
        return promptContext.recognized.succeeded && promptContext.recognized.value > 1 && promptContext.recognized.value < 150;
    }
    //to check date is valid or not
    async checkDate(promptContext) {
        // to check date is valid or not

        console.log("check date")
        console.log(promptContext.recognized.succeeded)
        console.log(promptContext.recognized.value)
        console.log("check date end")
        var x;
        for (var i of promptContext.recognized.value) {
            console.log(i['value']);
            x = i['value']
        }
        var date1 = new Date(x)
        console.log("date:" + date1.getFullYear())
        console.log("date type: "+typeof date1.getFullYear())
        var today = new Date()
        var yest = new Date(today)
        yest.setDate(yest.getDate()-1) 
        if (isNaN(date1.getFullYear()) != true) {
            if (promptContext.recognized.succeeded && date1 >= yest) {
                console.log("date is valid")
                return true;
            }
            else {
                console.log("date is invalid")
                console.log(date1)
                console.log(new Date())
                return false;
            }
        }
        else{
            return true;
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.MakeReservationDialog = MakeReservationDialog;







