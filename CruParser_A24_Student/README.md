# CruParser_A24_Student

Minimal project to run the CRU parser and a simple CLI.

Setup (PowerShell):

1. Open PowerShell and go to the project folder:
   ```BASH
   cd <Path>\<To>\<YourProject>\GL02_Projet\CruParser_A24_Student
   ```

2. Install dependencies:
   ```BASH
   npm install
   ```

3. Run the CLI test command:
   ```BASH
   node caporalCli.js check SujetA_data/AB/edt.cru
   ```

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
    →example:  <code>node caporalCli check <i>path/to/the/file/file.cru</i></code>
    <li> search : This command search in a text with : 
    <ul>
        <li>no option given : returns all the values of the given file parsed</li>
        ⮡ example:  <code>node caporalCli search <i>path/to/the/file/file.cru</i></code>
        <li>-n | --needle [needle] : returns the parsed values of the given file where the needle has been found.</li>
        ⮡ example: <code>node caporalCli search <i>path/to/the/file/file.cru</i> -n <i>needle</i></code>
        <li>-d | --day [day] : returns the parsed values of the given file where the day has been found.</li>
        ⮡ example: <code>node caporalCli search <i>path/to/the/file/file.cru</i> -d <i>day</i></code>
    </ul>
</li>