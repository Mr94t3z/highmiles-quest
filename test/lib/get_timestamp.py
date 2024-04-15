import datetime

# Define the date
start_date = datetime.datetime(2024, 4, 1)

end_date = datetime.datetime(2024, 4, 28)

# Convert the date to a timestamp
start = int(start_date.timestamp())

end = int(end_date.timestamp())

print("Start Date Timestamp:", start)

print("End Date Timestamp:", end)
