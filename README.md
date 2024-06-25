# Contact to CSV
This project is a simple cloudflare worker that takes an web form and saves it to Cloudflare's D1 database, while giving easy access to an export of that data via CSV.

After getting the project up and running, you can use the [submitForm.html file](./submitForm.html) to quickly send a form in to test everything is working as intended.

## Setup
To setup the project, you'll need to create a D1 database (any name will work) and then input its name and id into the wrangler.toml file. Make sure to remove the .example from the file name and change all of the values to your own (You'll also need to put in your worker's name).

In the database page, go to the console and paste in the following:
```sql
CREATE TABLE submissions (
  id integer PRIMARY KEY AUTOINCREMENT, 
  first_name text NOT NULL,
  last_name text NOT NULL, 
  email text NOT NULL
);
```

<details open>
<summary>You'll also need to create the following environment variables in the worker settings --> variables</summary>

* `PASSWORD`
  * This is the password you use to view the table as a csv
* `REDIRECT_URL`
  * This is the url you'll get redirected to on a successful contact form entry or if someone tries going to the base worker
</details>

## Running/Deploying
Just run `wrangler deploy` and follow the steps

## Developing
Just run `wrangler dev` and do the same as above
> [!IMPORTANT]
> You will need to turn off local mode as the worker is unable to access the database and (possibly) its environment variables. I'm unsure whether this is just how it works or a skill issue but 🤷


## Notes
<details>
<summary>Hello</summary>

> [!NOTE]
> I am quite silly! Some things could be done better (mainly the naming between the form and the db & general organization) but as long as it all works :)
<br>
> I also don't know what some of the typescript files do but I'm too scared to touch them so there they shall remain
</details>