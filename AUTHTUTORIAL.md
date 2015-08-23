#How to get your auth token without our servers
Here at sunshine, we completely understand why you dont want to share your email and password, but still want to use the service. So, we have made a tutorial on how to get your own auth token without going through anybody.

1. Go to [http://oc.tc/login](http://oc.tc/login), and enter your email and password. However, do NOT click log in.
<br>
2. Now you are going to navigate to the developer tools section of your browser.<br> On most browsers you can hit F12, but this tutorial will be done via chrome.
<br>
3. Once you are at a page that looks somewhat like this:
<br>![this](https://gyazo.com/e9d22f71d5ae3c727ccc674bc2605818.png) go to the bottom of your screen where it has the little magnifier glass. Directly to the right of it should be a tab called **Resources**. Click that.
<br>

4.Next, you will see something like this:
![enter image description here](https://gyazo.com/b6ba2355e75a7ff6b77a1bf10b443158.png)
Drag the little thing above console down, so you cant see the console part. It should now look like this : 
![enter image description here](https://gyazo.com/b9a47f2071c5bfe047169cd449e9c806.png)
<br>
5. Now you are finally going to login. Keep this bottom part up, though, you will be needing it shortly.
<br>
6. After logging in,  navigate to the bottom where, on the left part, it should say cookies. Click that, then click oc.tc. You should now see something similar to this:![enter image description here](http://imgur.com/Vaz4F6X.png) (I have blurred out my tokens because they are private).
7. In the table, there should be a cookie named  _ProjectAres_sess. The value of this cookie is the auth token that you can use in the api. Make sure to write or copy it down, because thats how you are going to be making API class from now on!