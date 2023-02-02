This a simple python test script
dependencies: nose2
to install: pip install nose2

run test on the a boostrap server:
'''
TEST_TARGET=144.202.122.8 nose2 -v
'''
(it should pass all test or there is bug in test script)

run test on the local server
'''
nose2 -v
'''
(it should pass all test or there is bug in typescript code)

test_set3.py is based on record_set3.txt