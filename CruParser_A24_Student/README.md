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
- `spec/` : folder containing Jasmine unit tests
- `/F2_capacity.spec.js` : tests for maxcap command
- `/F3_freeroom.spec.js` : tests for freeroom command
- `node_modules/` : installed dependencies including:
- `/jasmine` : testing framework for unit tests
- `@caporal/core` and `colors` : CLI dependencies

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
    <li> maxcapacity : This command returns the maximum capacity for a given room (Spec F2)  
    <ul>
        <li>Parameter:
            <ul>
                <li>room: Room identifier</li>
                ⮡ example: <code>node caporalCli.js maxcapacity D102</code>
            </ul>
        </li>
        <li>Errors:
            <ul>
                <li>Empty room identifier: <code>L’identifiant de la salle ne peut pas être vide.</code></li>
                <li>Non-existent room: <code>La salle n’existe pas.</code></li>
            </ul>
        </li>
        <li>Returns: The largest capacity among all courses scheduled in the room</li>
    </ul>
</li>

<li> freeroom : This command lists free time slots for a given room (Spec F3)  
    <ul>
        <li>Parameter:
            <ul>
                <li>room: Room identifier</li>
                ⮡ example: <code>node caporalCli.js freeroom D102</code>
            </ul>
        </li>
        <li>Errors:
            <ul>
                <li>Empty room identifier: <code>L’identifiant de la salle ne peut pas être vide.</code></li>
                <li>Non-existent room: <code>La salle n’existe pas.</code></li>
            </ul>
        </li>
        <li>Returns: A list of free hours for each day (Monday–Friday) in 1-hour steps</li>
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

#### Unit tests
<li>  Max Capacity   
    <ul>
        <li>Test file: <code>spec/F2_capacity.spec.js</code></li>
        <li>Command to run: <code>npm run test:f2</code></li>
        <li>What it checks:
            <ul>
                <li>Calculates the maximum capacity for an existing room</li>
                <li>Throws an error if the room identifier is empty</li>
                <li>Throws an error if the room does not exist</li>
            </ul>
        </li>
<li>Expected results/logs:
    <ul>
        <li>Existing room (e.g., D102):
            <pre>
Test: Retrieving the maximum capacity for room 'D102'
   - Number of courses found: 4
   - Maximum capacity found: 120
Success: maximum capacity correctly determined for 'D102'
            </pre>
        </li>
        <li>Empty room:
            <pre>
Test: Handling an empty room
   - Empty room detected correctly
Success: error correctly thrown for empty room
            </pre>
        </li>
        <li>Non-existent room:
            <pre>
Test: Non-existent room 'ROOM_NOT_REAL'
   - Number of courses found: 0
   - Room detected as non-existent
Success: error correctly thrown for non-existent room
            </pre>
        </li>
    </ul>
</li>
    <li>Free Room Slots (Spec F3)
        <ul>
        <li>Test file: <code>spec/F3_freeroom.spec.js</code></li>
        <li>Command to run: <code>npm run test:f3</code></li>
        <li>What it checks:
            <ul>
                <li>Computes free time slots for an existing room (hours 8h–19h)</li>
                <li>Throws an error if the room identifier is empty</li>
                <li>Throws an error if the room does not exist</li>
            </ul>
        </li>
<li>Expected results/logs:
    <ul>
        <li>Existing room (e.g., D102):
            <pre>
Test: Computing free time slots for room 'D102'
   - Courses found: 4
   - Example of free time slots:
{
  "L": [8, 9, 10, 13, 14, 15, 16, 17, 18, 19],
  "MA": [8, 9, 10, 11, 12, 15, 16, 17, 18, 19],
  "ME": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  "J": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  "V": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
}
Success: free time slots generated correctly for room 'D102'
            </pre>
        </li>
        <li>Empty room:
            <pre>
Test: Empty room identifier
   - Empty identifier detected
Success: error correctly thrown for empty room identifier
            </pre>
        </li>
        <li>Non-existent room:
            <pre>
Test: Non-existent room 'ROOM_NOT_REAL'
   - Courses found: 0
   - Room detected as non-existent
Success: error correctly thrown for non-existent room
            </pre>
        </li>
    </ul>
</li>