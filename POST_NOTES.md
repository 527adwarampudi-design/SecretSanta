# POST Notes

Partners:

Answer in your own words, 1–3 sentences each.

1. How is a GET request different from a POST request?
A get requst is used to ask for the data from a server, passing parameters directly to the web address. In contrast, post is a request used to send data to a server, placing that information securuly inside the body of the request rather than the url itself. 

2. What is the `body` of a fetch() request, and why does it need `JSON.stringify()`?
The body of a fetch request is the data payload attached when sendig infomration to a server vioa a post request. It needs json.stringify() because HTTP requests can only send text over netwrok, so the javascript data object must first be converted into a JSON-formatted text string. 

3. What does `doPost(e)` do with the data you send?
The function in apps script catches the incoming data rom e.postData.contnets and turns the text back into a usable object using JSON/parse(). it then clears out any old rows in the google sheets and appends a new row for each secrect santa pair and the gift rules 

4. How does your page know the data was saved?
your page knows the data was saced succesfully by chekcing that response.ok is true, passting the reply with response.json(), and confirming that the server's response contians {"result": "success"}.
## Links we used

-
