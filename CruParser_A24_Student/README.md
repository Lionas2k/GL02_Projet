# CruParser_A24_Student

Minimal project to run the CRU parser and a simple CLI.

Setup (PowerShell):

1. Open PowerShell and go to the project folder:
   cd "C:\Users\Rodri\Desktop\UTT\GL02\GL02_Projet\CruParser_A24_Student"

2. Install dependencies:
   npm install

3. Run the CLI test command:
   node caporalCli.js test "..\SujetA_data\AB\edt.cru"

Optional: search for a token (e.g. AP03):
   node caporalCli.js test "..\SujetA_data\AB\edt.cru" AP03

Files:
- `CruParser.js`: parser implementation
- `cours.js`: simple CRS constructor
- `caporalCli.js`: CLI with `test` command
- `package.json`: minimal dependencies

If `npm` is not installed on your machine, install Node.js (LTS) from https://nodejs.org/


## Run the program

### List of commands

<ul>
    <li> check : This command check if the file given is a correct cru file.</li>
    <li> search : This command search in a text with : 
    <ul>
        <li>no option given : returns all the values of the given file parsed</li>
        <li>-n | --needle [needle] : returns the parsed values of the given file where the needle has been found.</li>
        <li>-d | --day [day] : returns the parsed values of the given file where the day has been found.</li>
    </ul>
</li>
    