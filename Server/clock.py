import threading
import time
import RPi.GPIO as GPIO
output = [0,0,0,0]

def updateGPIO():

	decimalgpio = 33
	segments = [36, 40, 31, 35, 37, 38, 29]
	digits = [15, 13, 11]

	num = [
	[0,0,0,0,0,0,1],
	[1,0,0,1,1,1,1],
	[0,0,1,0,0,1,0],
	[0,0,0,0,1,1,0],
	[1,0,0,1,1,0,0],
	[0,1,0,0,1,0,0],
	[0,1,0,0,0,0,0],
	[0,0,0,1,1,1,1],
	[0,0,0,0,0,0,0],
	[0,0,0,0,1,0,0],
	[1,1,1,1,1,1,1]]

	GPIO.setmode(GPIO.BOARD)
	for d in range(20):
		try:
			GPIO.setup(d, GPIO.OUT, initial=GPIO.LOW)
		except:
			pass
 
	GPIO.setup(digits, GPIO.OUT, initial=GPIO.HIGH)
	GPIO.setup(segments, GPIO.OUT, initial=GPIO.LOW)
	GPIO.setup(33, GPIO.OUT, initial=GPIO.HIGH)
	GPIO.output(decimalgpio, 1)

	while True:
		for i in range(3):
			#GPIO.output(segments, 1)
			GPIO.output(digits, 0)
			GPIO.output(segments, num[output[i]])
			GPIO.output(digits[i], 1)
			time.sleep(0.002)


gpio = threading.Thread(name='GPIO', target=updateGPIO)
gpio.start()

while True:
	f = open("numbers")
	chars = f.read(4)
	f.close()
	for i in range(3):
		try:
			output[i] = int(chars[i+1])
		except:
			output[i] = 10
	time.sleep(60)
