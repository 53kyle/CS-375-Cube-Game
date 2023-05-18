# Final-Project

To run, open in VSCode and run 'parcel cubegame.html' in the terminal.

Presentation:
https://docs.google.com/presentation/d/19k4-MK7JQctiiPp-a04yl5Q87pyqHGqA2904Nu8XTc0/edit?usp=sharing

P.S.

I feel extremely unhappy with how my presentation went. My laptop was absolutely crippled by the projector but I should've implemented my code in such a way that it wouldn't have been so affected by that. For example, rather than setting a constant velocity for my camera and player object, I translate my camera and player object on the z axis every frame, which I'm sure A) isn't great for performance and B) isn't the way to do it if I don't want my game to be dependent on frame rate. And I had to set a lifespan for each cube so that they despawn roughly right after they're off screen because although by default, three.js is supposed to cull anything outside the viewing frustum, it definitely isn't doing so for me. Ironically, that lifespan is the only thing not affected by the frame rate since it's just based on a timed javascript function, and when I wrote that function I was assuming that a cube would be off screen much sooner than it would be when it's running slowly. Anyways, I at least want you to be able to see the game as it's supposed to look in motion, so I made a screen recording:

https://www.youtube.com/watch?v=Vhdq5s5I53I

It's funny, I recorded that on battery and somehow I didn't have any performance issues. I have no clue why the projector caused such a slowdown, expecially since it's certainly a lower resolution than my laptop's built-in screen.
