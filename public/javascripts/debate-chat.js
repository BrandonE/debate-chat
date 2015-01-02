/*
 * Debate Tournament Manager
 * Created by Brandon Evans for Binghamton University Speech & Debate.
 * NO OTHER ENTITY CAN USE THIS WITHOUT MY PERMISSION!
 * admin@brandonevans.org 2012-2013
*/
var minutes;
var playing = false;
var seconds;
var socket = io();
var ticked = true;
var timer;
var timers = {
	'aff': {
		'color': '#0044C0',
		'minutes': 10,
		'next': 'rebuttal',
		'name': 'Aff Prep',
		'seconds': 0,
		'update': '#timekeeper_aff'
	},
	'constructive': {
		'minutes': 9,
		'next': 'cross',
		'name': 'Constructive',
		'seconds': 0
	},
	'cross': {
		'minutes': 3,
		'next': 'constructive',
		'name': 'Cross-X',
		'seconds': 0
	},
	'neg': {
		'color': '#C00000',
		'minutes': 10,
		'next': 'rebuttal',
		'name': 'Neg Prep',
		'seconds': 0,
		'update': '#timekeeper_neg'
	},
	'rebuttal': {
		'minutes': 6,
		'next': 'rebuttal',
		'name': 'Rebuttal',
		'seconds': 0
	}
}

function pad(input, length, padding)
{
	while (input.length < length)
	{
		input = padding + input;
	}

	return input;
}

function playing_image()
{
	var image = '/images/timekeeper/synergy/play.png';

	if (playing)
	{
		image = '/images/timekeeper/synergy/pause.png';
	}

	$('#timekeeper_play').css('background-image', "url('" + image + "')");
}

function main_display()
{
	// Update the main time counter.
	$('#timekeeper_count_text').val(time_to_string());
}

function tick()
{
	ticked = true;

	if (playing)
	{
		seconds--;

		// Decrement the minute digit if all of the seconds have been counted.
		if (seconds < 0)
		{
			minutes--;

			if (minutes < 0)
			{
				// Time up.
				timer_stop();
				return;
			}

			seconds = 59;
		}

		main_display();
		update_display();

		setTimeout(tick, 1000);
		ticked = false;
	}
}

function time_parse(input)
{
	var sections = input.split(':');

	if (sections.length > 1)
	{
		// Handle the explicit semicolon.
		minutes = parseInt(sections[0]);
		seconds = parseInt(sections[1]);
	}
	else if (sections[0].length == 1)
	{
		// Assume the one digit provided is the number of minutes.
		minutes = parseInt(sections[0]);
		seconds = 0;
	}
	else
	{
		/*
		Assume the semicolon would have taken place before the last
		two digits.
		*/
		minutes = parseInt(
			sections[0].substr(0, sections[0].length - 2)
		);
		seconds = parseInt(
			sections[0].substr(sections[0].length - 2)
		);
	}

	if (isNaN(minutes))
	{
		minutes = 0;
	}

	if (isNaN(seconds))
	{
		seconds = 0;
	}

	if (seconds > 59)
	{
		// Refactor the number of seconds provided into the total time.
		minutes += Math.floor(seconds / 60);
		seconds = seconds % 60;
	}

	// Maximum time: 99:00.
	if (minutes > 99)
	{
		minutes = 99;
	}

	if (minutes == 99)
	{
		seconds = 0;
	}
}

function time_to_string()
{
	// Get a displayable version of the minutes and seconds.
	return minutes + ':' + pad(String(seconds), 2, '0');
}

function timer_set(t)
{
	// Set the timer and stop playing.
	timer = t;
	minutes = t.minutes;
	seconds = t.seconds;
	playing = false;
	playing_image();
	$('#timekeeper_count_text').val(time_to_string());

	// Set the title of the window to the timer name.
	document.title = t.name + ' - Debate Chat';

	if (timer.color)
	{
		$('#timekeeper_count_text').css('color', timer.color);
	}
	else
	{
		$('#timekeeper_count_text').css('color', 'black');
	}
}

function timer_stop()
{
	minutes = 0;
	playing = false;
	playing_image();
	alert('Time up!');
	// Set the next timer.
	timer_set(timers[timer.next]);
}

function update_display()
{
	// Update the timer panel if required.
	if (timer.update)
	{
		timer.minutes = minutes;
		timer.seconds = seconds;
		$(timer.update).text(time_to_string());
	}
}

$(document).ready
(
    function ()
    {
		timer_set(timers.constructive);

		$('form').submit(function () {
			var message = $('#message').val();

			if (message) {
				socket.emit('chat message', message);
				$('#message').val('');
			}

			return false;
		});

		socket.on('user connected', function () {
			$('#messages').prepend($('<li>').text('User connected'));
		});

		socket.on('user disconnected', function () {
			$('#messages').prepend($('<li>').text('User disconnected'));
		});

		socket.on('chat message', function (msg) {
			$('#messages').prepend($('<li>').text(msg));
		});

		$('#timekeeper_aff').click
		(
			function ()
			{
				timer_set(timers.aff);
			}
		);

		$('#timekeeper_count_text').focus
		(
			function ()
			{
				playing = false;
				playing_image();
			}
		);

		$('#timekeeper_count_text').keypress
		(
			function (event)
			{
				// Only allow time characters to be entered.
				var key = (event.keyCode ? event.keyCode : event.which);

				if (key >= 48 && key <= 58)
				{
					// Numbers and semicolons.
					return true;
				}

				return false;
			}
		);

		$('#timekeeper_count_text').keyup
		(
			function ()
			{
				time_parse($('#timekeeper_count_text').val());
				update_display();
			}
		);

		$('#timekeeper_constructive').click
		(
			function ()
			{
				timer_set(timers.constructive);
			}
		);

		$('#timekeeper_cross').click
		(
			function ()
			{
				timer_set(timers.cross);
			}
		);

		$('#timekeeper_neg').click
		(
			function ()
			{
				timer_set(timers.neg);
			}
		);

		$('#timekeeper_play').click
		(
			function ()
			{
				// Start playing if stopped and vice-versa.
				playing = !playing;
				playing_image();
				main_display();

				if (ticked)
				{
					/*
					It seems like the first click is slower for some reason...
					delaying for .9 seconds to compensate for now.
					*/
					setTimeout(tick, 900);
					ticked = false;
				}
			}
		);

		$('#timekeeper_rebuttal').click
		(
			function ()
			{
				timer_set(timers.rebuttal);
			}
		);
	}
);