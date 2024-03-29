const CommandReturningSubrequest = require('./SubRequest');

let ASSIST_MODE;

class Query extends CommandReturningSubrequest{

    #_assistMode;

    /**
     * @constructor
     * @param  {string} query
     */
    constructor(query){
        super();
        this.query = query;
    }

    get assistMode(){
        return ASSIST_MODE || this.#_assistMode;
    }

    async *getPrompts(){
        const choices = ['yes - for this query', 'no - for this query', 'always', 'never' ]
        /** @type {import("../../../types/command/Diviner").Question} */
        let prompts = [
            {
                message: 'Enable assist mode?',
                name: 'assistModeSelection',
                type: 'select',
                // skip if global or query assist mode already selected
                skip: (ASSIST_MODE !== undefined) || (this.#_assistMode !== undefined),
                choices,
                result: (value) => {
                    switch (value) {
                        case choices[0].value:
                            this.#_assistMode = true;
                            break;
                        case choices[1].value:
                            this.#_assistMode = false;
                            break;
                        case choices[2].value:
                            ASSIST_MODE = true;
                            break;
                        case choices[3].value:
                            ASSIST_MODE = false;
                            break;
                        default:
                            break;
                    }
                    
                    return value;
                },
            }
        ];
        yield prompts;
        if(this.assistMode){
            // todo
        } else{
            prompts = [{
                message: 'Enter your query',
                name: 'query',
                type: 'input',
                skip: this.assistMode,
                required: !this.assistMode
            }];
            yield prompts;
        }
    }

    async readyToExecute(){
        return this.query || this.query ? true : 'Need query to execute';
    }

    async executeInteractive(){
        return await this.execute();
    }
    
    async execute(){
        return new this.subrequestTypes.query(this.referenceId, this.query);
    }
}

/**
 * 
 * @param {QueryArgs} argObj 
 * @returns 
 */
module.exports = (argObj) => {
    return new Query(argObj);
}