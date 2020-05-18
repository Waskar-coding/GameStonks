#Descripción
"""
Resolución numérica del ejercicio 3 del tema 2 de la asignatura de Energía.
He querido ir un poco más allá de las condiciones iniciales del enunciado y
he creado un programa en el que se pueden jugar con los parámetros.
Funciona con Python 3.7
Si alguien quiere el código lo colgaré en mi GitHub donde estoy haciendo 
otro proyecto.
"""
__author__ = 'Óscar Gómez Nonnato'
__date__ = '20/03/2020'



#Librerias
import numpy as np



#Area de la esfera
def get_a(d: float) -> float:
	return np.pi*d**2


#Coeficiente de convección forzada del aire en una esfera
def get_h(s: str, t: float, p:float, d: float, v: float) -> float:
	#Documentación
	if s == "Aire":
		vol = 1.43*10**-5
		k = 0.0249
		pr = 0.714
	else:
		import requests
		url = 'http://hesaplayicilar.productselector.net/AkiskanHesaplayici/AkiskanHesapla'
		body = {'Values':{"Akiskan": s, "Sicaklik": t, "AtmosferikBasinc": p}}
		response = requests.post(url, json=body).json()
		vol = response['yogunlukSonuc']**-1
		k = response['IsilIletkenlikSonuc']
		cp = response['ozgulIsiSonuc']
		u = response['DinamikViskozitekSonuc']
		pr = u * cp / k 

	re = v*d/vol
	nu = 2 + (0.4*re**0.5 + 0.6*re**(2/3))*pr**0.4	
	return nu * k / d


#Balance de energías (first class)
def get_balance(
	q_e: float, 
	a: float, 
	e: float, 
	h: float, 
	t_a: float
	):
	##Documentación
	"""
	Función de primera clase, devuelve la función para el calculo de la temperatura T
	con diferentes parametros
	"""
	##Constatnte de Stefan-Boltzmann
	o = 5.6704*10**-8
	
	##Construyento la función de balance de energías
	def balance(t: float) -> float:
		q_rad = e*a*o*(t**4-t_a**4)
		q_con = h*a*(t-t_a)
		return q_rad + q_con - q_e
	return balance


#Aproximación gráfica de t
def aprox_t(balance, t_v: list) -> float:
	b_v = list(map(balance,t_v))
	b_v_abs = list(map(abs,b_v))
	i = b_v_abs.index(min(b_v_abs))
	return (b_v, t_v[i])



#Función principal
def main():
	print("""PARAMETROS""")

	print('Características de la bombilla')
	print('------------------------------')
	d = float(input('Diámetro de la bombilla: '))
	q_e = float(input('Calor de entrada: '))
	e = float(input('Emisividad de la bombilla: '))
	print('\n')

	print('Características del fluido')
	print('--------------------------')
	s = input('Fluido: ')
	v = float(input('Velocidad del fluido: '))
	t_a = float(input('Temperatura fluido fluido: '))
	p_a = float(input('Presión del fluido: '))
	print('\n')

	print('Parámetros para evaluar el problema')
	print('-----------------------------------')
	t_min = float(input('Temperatura mínima eval: '))
	t_max = float(input('Temperatura máxima eval: '))
	step = float(input('Precisión: '))
	print('\n')

	a = get_a(d)
	h = get_h(s,t_a,p_a,d,v)
	balance = get_balance(q_e, a, e, h, t_a)

	t_v = list(np.arange(t_min, t_max, step))
	b_v, t = aprox_t(balance, t_v)
	print('Resultado')
	print('---------')
	print('Temperatura aproximada: {}'.format(t))



#Ejecución
if __name__ == '__main__':
	main()
