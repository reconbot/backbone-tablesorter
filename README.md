This is a very functional Backbone.js table sorter plugin that respects your views(). Its primary usecase (to be abstracted away into a subclass) is currently to show you some rows and let you swap out or add another row that has more details. I imagine you'll want to do something else with it. I made this because I wanted people to be able to sort things while not destroying all their work.

I the backbone-tablesorter promise to:
  - Not destroy your views unless you destory my models
  - Not care about your rendering or updating, that's between you and your model.
  - Keep all your bindings
  - Do the annoying sutff for you
  - Love twitter bootstrap but not make you marry it
  - Love mustache.js but not make you marry it either
  - Require backone.js underscore.js and jquery 
  - (I don't know about this zepto fellow but I'll gladly support him if it does the right stuff.)

I will never do:
  - Re-render your models to sort
  - Drink too much coffeescript
  - Care what you do in the sanctity of your own tr

I only ask that you the model:
  - Keep yourself a tr, I don't care about anything else
  - Emit events when you'd like me to swap you out
  - Only join a collection who's either a SortableList or knows one personally. (If you do a good impression that will fly too.)

