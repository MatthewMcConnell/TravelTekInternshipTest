/**jsonPeopleStats library/script - a small library/script allowing you to run any statistics on
 *                                  an array of JSON objects. (In this example I run stats on people)
 * @author = Matthew McConnell
 * 
 * last modified: 05/05/2018
 */


/* 
   Some thoughts: - It is obvious that we need to convert the JSON file into a JS array of objects
                  - Now since we have an array there isn't a fancy or special way to easily find
                    all of our answers to our statistics, so we need to iterate through the array
                    to find our answers.
                  - However it would be sensible to only iterate through the array once and once
                    only, rather than iterating through for each statistic as for example if you
                    did not then with 10,000 elements and 10 statistics this would be 100,000
                    iterations, a whole factor of 10 higher
*/


/**This is the main function to run your statistics on. It takes the url of the JSON file
 * you are performing analysis on and allows an unlimited number of functions as additional arguments.
 * You will see below that these functions require an element, index and array parameter
 * as part of the forEach() function as well as an object 'results' of which to store all its
 * working and final results.
 */

function runStatistics (url)
{
    // Getting the JSON file data and storing it into a variable to be
    var jsonData;

    // .ajax() with async = false is deprecated because it worsens user experience
    // but I could not find a nice solution to this, if someone could help me out that would be great :)
    $.ajax({
        url: url,
        dataType: "json",
        type: "get",
        async: false,
        success: function (data) {
            jsonData = data;
        }
    });

    // Setting up a dictionary that can be passed by forEach as 'this' into my statsFunction
    // That contains all functions I want to run
    var resultsAndFunctions = {};

    // Iterating through arguments to add functions as you should not slice on arguments
    // as it prevents optimisations
    var functions = [];
    var numOfArgs = arguments.length;
    for (argNum = 1; argNum < numOfArgs; argNum++)
    {
        functions.push (arguments[argNum]);
    }

    resultsAndFunctions["functions"] = functions;

    // Setting up a results object for the functions to add results to
    resultsAndFunctions["results"] = {};

    console.log ("Now computing all stats...");
    console.log ("\n");

    // forEach() will pass element, index and array values to statFunctions as well as
    // the object 'resultsAndFunctions' as the 'this' value
    jsonData.forEach(statFunctions, resultsAndFunctions);

    console.log ("All stats computed. :)");
    
}






/**This function expects an element, index and array parameter from forEach() to be passed onto
 * functions that are to be executed. It also expects a 'this' value to be passed from forEach()
 * that contains the results object to store results and a list of functions to call
 */

function statFunctions (element, index, array)
{
    for (functionNum = 0; functionNum < this.functions.length; functionNum++)
    {
        this.functions[functionNum] (element, index, array, this.results);
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////

/**The main stat functions below all require to take an element, index and array parameter.
 * It should also take a results parameter which is an object to use to store its results.
 * The function should also (at least currently in this libraries state) print its own results.
 */

////////////////////////////////////////////////////////////////////////////////////////////////





/**Simply creates an accumulator and adds 1 if it finds someone with green eyes */

function numOfPeopleWithGreenEyes (element, index, array, results)
{
    if (index == 0)
    {
        results["Number of People with Green Eyes"] = 0;
    }

    if (element.eyeColor == "green")
    {
        results["Number of People with Green Eyes"] += 1;
    }

    if (index == array.length - 1)
    {
        console.log ("The number of people with green eyes: " + results["Number of People with Green Eyes"]);
        console.log ("\n");
    }
}





/**Prints out the top 10 most common surnames along with the number of them.
 * It does this by creating an object that contains surnames for keys and 
 * the number of occurences of them as their values. The simply the ten
 * surnames with the highest values are printed out to the console.
 */

function top10MostCommonSurnames (element, index, array, results)
{
    if (index == 0)
    {
        results["Surname Counter"] = {};
    }


    if (element.name.last in results["Surname Counter"])
    {
        results["Surname Counter"][element.name.last] += 1;
    }
    else
    {
        results["Surname Counter"][element.name.last] = 1;
    }


    if (index == array.length - 1)
    {
        console.log ("The top 10 most common surnames with their totals are: ")

        var mostCommonSurnames = findMaxKeyValues (10, results["Surname Counter"]);

        for (var i = 0; i < mostCommonSurnames.length; i++)
        {
            console.log (mostCommonSurnames[i] + " - " + results["Surname Counter"][mostCommonSurnames[i]]);
        }

        console.log ("\n");
    }
}


/**Helper function that returns a list of keys of size numberOfMaxKeyValues such that they are
 * the keys with the maximum values. If there are ties, it simply ignores this and chooses the
 * first key it came across with the tied max value.
 */

function findMaxKeyValues (numberOfMaxKeyValues, dictionary)
{
    var maxValuesArray = [];
    var minInArray;

    for (var key in dictionary)
    {
        if (maxValuesArray.length < numberOfMaxKeyValues)
        {
            maxValuesArray.push (key);
        }
        else
        {
            if (minInArray == undefined)
            {
                minInArray = findKeyInArrayWithMinValue (maxValuesArray, dictionary);
            }

            if (dictionary[key] > dictionary[minInArray])
            {
                maxValuesArray[maxValuesArray.findIndex (minInArray)] = key;
                minInArray = findKeyInArrayWithMinValue (maxValuesArray, dictionary);
            }
        }
    }

    return maxValuesArray;
}


/**Helper function that finds the key with the minimum value in an array of keys */

function findKeyInArrayWithMinValue (array, dictionary)
{
    var minKeyValueInArray = array[0];

    for (key in array)
    {
        if (dictionary[key] < dictionary[minKeyValueInArray])
        {
            minKeyValueInArray = key;
        }
    }

    return minKeyValueInArray;
}





/**This function finds the closest person to the eiffel tower by computing the distance for each
 * person and saving the person if it has the lowest distance to the eiffel tower so far.
 * After iteration we show the details of the person closest in the console.
 */

function findPersonClosestToEiffelTower (element, index, array, results)
{
    const eiffelLat = 48.8584;
    const eiffelLong = 2.2945;

    // If we just started then make them the person closest to the eiffel tower
    // Otherwise compare to the current closest person and replace if they are closes
    if (index == 0)
    {
        results["Person Closest To Eiffel Tower"] = [element, calculateCoordinateDistanceWithHaversine (element.latitude,
                                                                                                        element.longitude,
                                                                                                        eiffelLat,
                                                                                                        eiffelLong)];
    }
    else
    {
        var personsDistanceFromEiffelTower = calculateCoordinateDistanceWithHaversine (element.latitude, element.longitude, eiffelLat, eiffelLong);

        if (personsDistanceFromEiffelTower < results["Person Closest To Eiffel Tower"][1])
        {
            results["Person Closest To Eiffel Tower"] = [element, personsDistanceFromEiffelTower];
        }
        
        // If we are at the end of the array then show the closest persons details
        if (index == array.length - 1)
        {
            console.log ("Details of the person closest to the Eiffel Tower:")

            var personClosestToEiffelTower = results["Person Closest To Eiffel Tower"][0]

            for (key in personClosestToEiffelTower)
            {
                if (key == "name")
                {
                    console.log (key + ": " + personClosestToEiffelTower.name.first + " " + personClosestToEiffelTower.name.last);
                }
                else
                {
                    console.log (key + ": " + personClosestToEiffelTower[key]);
                }
            }

            console.log ("\n");
        }
    }
}


/**Upon some research of finding the distance between points it is clear that we can't simply
 * use the pythagorean theorem as this is only for 2D planes. We should use the haversine
 * formula instead (its wiki can be found here: https://en.wikipedia.org/wiki/Haversine_formula )
 */


/**Here is a small helper function to calculate and return the distance of 2 sets of latitudes
 * and longitudes by the haversine formula
 */

function calculateCoordinateDistanceWithHaversine (lat1, long1, lat2, long2)
{
    const EARTHRADIUS = 6371;

    var latDifference = degreeToRadians (lat2 - lat1);
    var longDifference = degreeToRadians (long2 - long1);

    var latSinSquared = Math.pow (Math.sin (latDifference / 2), 2);
    var longSinSquared = Math.pow (Math.sin (longDifference / 2), 2);

    var arcSinInput = Math.sqrt (latSinSquared + Math.cos(degreeToRadians (lat1)) * Math.cos(degreeToRadians (lat2)) * longSinSquared);

    return 2 * EARTHRADIUS * Math.asin (arcSinInput);
}


/**Here is another small helper function to convert degrees into radians for the haversine function */

function degreeToRadians (degrees)
{
    return degrees * (Math.PI / 180);
}





/**Finds the average age of people with blue eyes by adding all the ages of people with
 * blue eyes and then dividing by the number of people with blue eyes
 */

function averageAgeOfPeopleWithBlueEyes (element, index, array, results)
{
    if (index == 0)
    {
        results["Sum of ages of People With Blue Eyes"] = 0;
        results["Number of people with blue eyes"] = 0;
    }

    if (element.eyeColor == "blue")
    {
        results["Sum of ages of People With Blue Eyes"] += element.age;
        results["Number of people with blue eyes"] += 1;
    }

    if (index == array.length - 1)
    {
        results["Average age of People With Blue Eyes"] = results["Sum of ages of People With Blue Eyes"] / results["Number of people with blue eyes"];

        console.log ("The average age of people with blue eyes is: " + results["Average age of People With Blue Eyes"]);
        console.log ("\n");
    }
}







/**What if a company discriminates based on eye colour? Then we have to EXPOSE THEM!
 * Let us find the company with the biggest pay difference between different eye colours.
 * Then we will reveal their horrible inclination to the world!
 */

function findCompanyWithLargestEyeColourDiscrimination (element, index, array, results)
{
    // Accumulates all values needed to get an average of pay for each eye colour in each company
    if (index == 0)
    {
        results["Eye Discrimination"] = {};
    }

    if (!(element.company in results["Eye Discrimination"]))
    {
        results["Eye Discrimination"][element.company] = {};
    }

    if (element.eyeColor in results["Eye Discrimination"][element.company])
    {
        results["Eye Discrimination"][element.company][element.eyeColor][0] += convertPayToNumber(element.balance);
        results["Eye Discrimination"][element.company][element.eyeColor][1] += 1;
    }
    else
    {
        results["Eye Discrimination"][element.company][element.eyeColor] = [convertPayToNumber (element.balance), 1];
    }


    // To finish off we find the biggest and smallest average wage for eye colours in each company
    // and then find the company with the biggest difference between their 2 values.
    // THEN WE EXPOSE THEM!!!

    if (index == array.length - 1)
    {
        var maxPayDifference = undefined;

        for (company in results["Eye Discrimination"])
        {
            var minEyeAveragePay = undefined;
            var maxEyeAveragePay = undefined;

            for (eyeColor in results["Eye Discrimination"][company])
            {
                var sumOfBalances = results["Eye Discrimination"][company][eyeColor][0];
                var numOfPeople = results["Eye Discrimination"][company][eyeColor][1];
                results["Eye Discrimination"][company][eyeColor][2] = sumOfBalances / numOfPeople;

                if (minEyeAveragePay == undefined)
                {
                    minEyeAveragePay = maxEyeAveragePay = [eyeColor, results["Eye Discrimination"][company][eyeColor][2]];
                }

                // Checking for if the eye color average for the company is its smallest or biggest yet.
                if (results["Eye Discrimination"][company][eyeColor][2] < minEyeAveragePay[1])
                {
                    minEyeAveragePay = [eyeColor, results["Eye Discrimination"][company][eyeColor][2]];
                }

                if (results["Eye Discrimination"][company][eyeColor][2] > maxEyeAveragePay[1])
                {
                    maxEyeAveragePay = [eyeColor, results["Eye Discrimination"][company][eyeColor][2]];
                }
            }

            var payDifference = maxEyeAveragePay[1] - minEyeAveragePay[1];

            // Checking to see if this recently computed company pay difference is the biggest we've had so far
            if (maxPayDifference == undefined || payDifference > maxPayDifference[3])
            {
                maxPayDifference = [company, maxEyeAveragePay[0], minEyeAveragePay[0], payDifference];
            }
        }

        // Showing the details of the worst company discrimination
        console.log ("The company with the biggest discrimination on eye colour is "
                     + maxPayDifference[0]
                     + " with it giving "
                     + maxPayDifference[1]
                     + " eyed people £"
                     + maxPayDifference[3]
                     + " more than "
                     + maxPayDifference[2]
                     + " eyed people on average! Terrible!!!");
        console.log ("\n");
    }
}


/**Small helper function to convert pay/balance into a number */

function convertPayToNumber (string)
{
    return parseFloat (string.replace (/,/g, ""));
}








// Here you can call the runStatistics method with a url and then an unlimited amount of stat functions
// (Remember the stat functions can be anything as long as they conform to the standard)
runStatistics ("fakepeople.json",
               numOfPeopleWithGreenEyes, 
               top10MostCommonSurnames, 
               findPersonClosestToEiffelTower, 
               averageAgeOfPeopleWithBlueEyes,
               findCompanyWithLargestEyeColourDiscrimination);





/**Ending Points: - I probably spent longer on this than I should have but it was fun to dive in
 *                  and write some code so I got a bit carried away :D
 *                - There are definitely some minor inefficiencies here and there and possible code
 *                  refactoring or decisions to be made as well (store the values or just present them?)
 *                - I tried to make it as modular as possible so it was very reusable.
 */
