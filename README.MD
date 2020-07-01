# Express Jobly

This is a longer exercise from Springboard Bootcamp to practice Node, Express, and PostgreSQL with relationships. In it, I had to build “Jobly”, a job searching and connecting API.]

##Goals and Requirements

- All responses should be in JSON. Use Insonmia or curl to test your API.
- Be thoughtful about function and variable names, and write appropriate documentation for every function and route.
- After each section, expect to write tests for the routes in that section.
- For each resource, place all SQL/database logic in a class. We do not want to see ANY SQL in the routes!

###Part One: Setup / Starter Code
Setup:

- Create a project folder, Git repository, and package.json
- Install the libraries needed

Starter Code:

For PATCH routes that need to “partially update” a database object, we’ve provided a useful helper function in **partialUpdate.js.** Read the code and documentation and figure out what it will be useful for.

Write a unit test for this function.

###Part Two: Companies
Create a table for companies, each company should have a:

- **handle**: a primary key that is text
- **name**: a non-nullable column that is text and unique
- **num_employees**: a column that is an integer
- **description**: a column that is text
- **logo_url**: a column that is text

####Routes

Create an **API** that has the following five routes:

####GET /companies

This should return the handle and name for all of the company objects. It should also allow for the following query string parameters

- **search**. If the query string parameter is passed, a filtered list of handles and names should be displayed based on the search term and if the name includes it.
- **min_employees**. If the query string parameter is passed, titles and company handles should be displayed that have a number of employees greater than the value of the query string parameter.
- **max_employees**. If the query string parameter is passed, a list of titles and company handles should be displayed that have a number of employees less than the value of the query string parameter.
- If the **min_employees** parameter is greater than the **max_employees** parameter, respond with a 400 status and a message notifying that the parameters are incorrect.

This should return JSON of `{companies: [companyData, ...]}`

####POST /companies

This should create a new company and return the newly created company.

This should return JSON of `{company: companyData}`

####GET /companies/[handle]

This should return a single company found by its id.

This should return JSON of {company: companyData}
  
####PATCH /companies/[handle]
This should update an existing company and return the updated company.

This should return JSON of `{company: companyData}`

####DELETE /companies/[handle]
This should remove an existing company and return a message.

This should return JSON of `{message: "Company deleted"}`

####Validation and Testing
For your POST and PATCH methods, you should validate the provided data with the JSON schema validator.

Add tests for each route you created in this section.

###Part Three: Jobs
**Before you continue, make sure you have completed the exercises in the previous sections. This exercise builds off of the previous exercise.**

Add a table for jobs, each job should have an:

- **id**: a primary key that is an auto incrementing integer
- **title**: a non-nullable column
- **salary** a non-nullable floating point column
- **equity**: a non-nullable column that is a float. For example, 0.5 equity represents 50% in a company. Ensure that you have a constraint that does not allow for equity to be greater than 1 when created.
- **company_handle**: a column which is a foreign key to the handle column
- **date_posted**: a datetime column that defaults to whenever the row is created

The **jobs** table has a one to many relationship with **companies** which means there is a foreign key in the jobs table that references the companies table. In this relationship, one company has many jobs, and each job belongs to a single company.

Make sure then when a company is deleted, all of the jobs associated with that company are deleted also.

####New Routes
Make sure your application has the following routes:

####POST /jobs
This route creates a new job and returns a new job.

It should return JSON of `{job: jobData}`

####GET /jobs
This route should list all the titles and company handles for all jobs, ordered by the most recently posted jobs. It should also allow for the following query string parameters

- **search**: If the query string parameter is passed, a filtered list of titles and company handles should be displayed based on the search term and if the job title includes it.
- **min_salary**: If the query string parameter is passed, titles and company handles should be displayed that have a salary greater than the value of the query string parameter.
- **min_equity**: If the query string parameter is passed, a list of titles and company handles should be displayed that have an equity greater than the value of the query string parameter.

It should return JSON of `{jobs: [job, ...]}`

####GET /jobs/[id]
This route should show information about a specific job including a key of company which is an object that contains all of the information about the company associated with it.

It should return JSON of `{job: jobData}`

####PATCH /jobs/[id]
This route updates a job by its ID and returns an the newly updated job.

It should return JSON of `{job: jobData}`

####DELETE /jobs/[id]
This route deletes a job and returns a message.

It should return JSON of `{ message: "Job deleted" }`

####Update Routes from Part One
Update the following routes:

####GET /companies/[handle]
This should return a single company found by its id. It should also return a key of jobs which is an array of jobs that belong to that company: {company: `{...companyData, jobs: [job, ...]}}`

####Validation and Testing
For your POST and PATCH methods, you should validate the provided data with the JSON schema validator.

Add tests for each route you created in this section.

###Part Four: Users
Create a table for users, each user should have a:

- **username**: a primary key that is text
- **password**: a non-nullable column
- **first_name**: a non-nullable column
- **last_name**: a non-nullable column
- **email**: a non-nullable column that is and unique
- **photo_url**: a column that is text
- **is_admin**: a column that is not null, boolean and defaults to false

####Routes
Create an API that has the following five routes:

####POST /users
This should create a new user and return information on the newly created user.

This should return JSON: {user: user}

####GET /users
This should return the username, first_name, last_name and email of the user objects.

This should return JSON: `{users: [{username, first_name, last_name, email}, ...]}`

####GET /users/[username]
This should return all the fields for a user excluding the password.

This should return JSON: `{user: {username, first_name, last_name, email, photo_url}}`

####PATCH /users/[username]
This should update an existing user and return the updated user excluding the password.

This should return JSON: `{user: {username, first_name, last_name, email, photo_url}}`

####DELETE /users/[username]
This should remove an existing user and return a message.

This should return JSON: `{ message: "User deleted" }`

####Validation and Testing
For your POST and PATCH methods, you should validate the provided data with the JSON schema validator.

Add tests for each route you created in this section.

###Part Five: Authentication / Authorization
Add the following route:

####POST /login
This should authenticate a user and return a JSON Web Token which contains a payload with the username and is_admin values.

This should return JSON: {token: token}

Change the following route:

####POST /users
This should create a new user and return a JWT which includes the username and whether or not the user is an admin.

This should return JSON: `{token: token}`

Protect the following routes and make sure only a user who has authenticated in can use them:

####GET /jobs
####GET /jobs/[id]
####GET /companies
####GET /companies/[handle]
Protect the following routes and make sure they are only accessible by the logged-in user with the same username:

####PATCH /users/[username]
####DELETE /users/[username]
Protect the following routes and make sure they are only accessible by a user who is an admin:

####POST /companies
####POST /jobs
####PATCH /companies/[handle]
####DELETE /companies/[handle]
####PATCH /jobs/[id]
####DELETE /jobs/[id]
