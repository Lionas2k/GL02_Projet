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
    <li> ical : This command generates an iCalendar (.ics) file for specified courses between two dates.
    <ul>
        <li>Parameters:
            <ul>
                <li>&lt;start&gt; : Start date in YYYY-MM-DD format</li>
                <li>&lt;end&gt; : End date in YYYY-MM-DD format</li>
                <li>&lt;courses...&gt; : One or more course codes (e.g., SY02, MT09, CL02)</li>
            </ul>
        </li>
        <li>-o | --output [filename] : Specify the output filename (default: calendar.ics)</li>
        ⮡ example: <code>node caporalCli ical 2024-01-15 2024-06-30 SY02 MT09 -o mon_calendrier.ics</code>
    </ul>
    </li>
    <li> checkconflicts : This command checks for scheduling conflicts in all CRU files by detecting overlapping time slots in the same room on the same day and week.
    <ul>
        <li>no option given : displays basic conflict report with course names, room, day and time</li>
        ⮡ example: <code>node caporalCli checkconflicts</code>
        <li>-d | --detailed : displays detailed conflict information including course indices</li>
        ⮡ example: <code>node caporalCli checkconflicts --detailed</code>
    </ul>
    </li>
    <li> salleCours : This command gives a list of classrooms in which the class specified by the user is taking place.
    <ul>
        <li>Parameter :
                <ul>
                <li>name : Name of the class</li>
                ⮡ example: <code>node caporalCli salleCours GL02</code>
                </ul>
        </li>
        <li>Options :
            <ul>
            <li>no option given : Displays a list of classrooms, taking in classes of all types </li>
            <li>-c | --filtercm : Filter by CM type classes</li>
            ⮡ example: <code>node caporalCli salleCours MA03 -c</code>
            <li>-t | --filtertp : Filter by TP type classes</li>
            ⮡ example: <code>node caporalCli salleCours AP03 -t</code>
            <li>-d | --filtertd : Filter by TD type classes</li>
            ⮡ example: <code>node caporalCli salleCours GE37 -d</code>
            </ul>
        </li>
    </ul>
    </li>
    <li> tauxSalles : This command gives back a graph of occupation rates by classroom to the user in .svg and can export related data to a .csv file.
    </li>
    <ul>
        <li>Parameters :
                <ul>
                <li>firstDay : Starting day of the time period : "L", "MA", "ME", "J", "V"</li>
                <li>firstHour : Starting hour of the time period, from 8:00 to 20:00</li>
                <li>firstWeek : Starting week of the time period : "F0" to "F9"</li>
                <li>lastDay : Ending day of the time period : "L", "MA", "ME", "J", "V"</li>
                <li>lastHour : Ending hour of the time period, from 8:00 to 20:00</li>
                <li>lastWeek : Ending week of the time period : "F0" to "F9"</li>
                </ul>
                ⮡ example: <code>node caporalCli tauxSalles L 8:30 F1 J 17:00 F2</code>
                <br>
                ⮡ example: <code>node caporalCli tauxSalles MA 15:30 F1 ME 19:00 F1</code> 
        </li>
        <li>Options :
            <ul>
            <li>-c | --filtercm : Filter by CM type classes</li>
            ⮡ example: <code>node caporalCli tauxSalles MA 15:30 F1 ME 19:00 F1 -c</code> 
            <li>-t | --filtertp : Filter by TP type classes</li>
            ⮡ example: <code>node caporalCli tauxSalles L 10:30 F2 V 19:00 F2 -t</code> 
            <li>-d | --filtertd : Filter by TD type classes</li>
            ⮡ example: <code>node caporalCli tauxSalles MA 9:00 F1 ME 15:30 F1 -d</code> 
            <li>-e | --export : Exports the rooms with their associated rates in a .csv file</li>
            ⮡ example: <code>node caporalCli tauxSalles ME 9:30 F1 J 16:30 F2 -e</code> 
            </ul>
        </li>
    </ul>
</ul>