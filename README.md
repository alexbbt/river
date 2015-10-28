# River

##### Did you receive help from any other sources (classmates, etc.)? If so, please list who.
Nope.

##### Did you complete any advanced extensions to this challenge? If so, what?
Yes, all of (Authentication and Authorization), also Facebook login (including tying your Facebook to an existing account, and removing it).
I sort of used a Templating Engine, I used the `jQuery.load()` function a lot to load separate html files.

##### Approximately how many hours did it take you to complete this challenge?
A lot, like way too many. I lost count after like 10.

##### Did you encounter any problems in this challenge we should warn students about in the future? How can we make the challenge better?
I did not, but the people, I helped, kept using the same id for multiple DOM elements on the page, which caused a lot of problems.


#### Final Website:
My finished site can be found at:
[/alexbbt/info343/river/](http://students.washington.edu/alexbbt/info343/river/)


#### Other cool thing I made:
Also I made a cool page to view all my projects (Which uses PHP to update **Dynamically** as I add more projects):
[/alexbbt/info343/](http://students.washington.edu/alexbbt/info343/)

#### Crude Templating Engine:
Third, I rolled my own crud templating engine, 
I used this a lot to dynamically create the page as the user navigates.
The elements of which can be viewed here:
[/alexbbt/info343/river/assets/html](http://students.washington.edu/alexbbt/info343/river/assets/html)

You will notice that the hash url changes as you move around the site, allowing the user to navigate with the back button.

#### Cloud Code:
I used cloud code to compute the average for every product one the cloud instead of using excess `.count()` calls.

#### Custom Bootstrap:
I customized the bootstrap to make the page have a flatter feel.

#### Progress Bar:
I made a custom progress bar object to handle the incrementation of a progress bar with an async function, allowing me to give the user feed back but also let them know its taking longer than normal if it is.  Try uploading an image on the new product page, and watch the magic.