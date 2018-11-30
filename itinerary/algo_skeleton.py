from algo_helpers import *

####################
# MASTER ALGORITHM #
####################

def create_itinerary(user_args):
    '''
    this is the master function that will generate an itinerary given the
    user inputs

    inputs:
        user_args (unknown) - some data structure that is passed back from
                              the front end, should contain:
                              + start time
                              + start location
                              + distance radius
                              + choose only free events
                              + transportation method
                              + user id
    '''
    ############################################################
    # Variables to keep track of various things during runtime #
    ############################################################
    radius_mem = [0, 0]
    itin_mem = 0
    itinerary = []

    ####################################################
    # Step 0: Assume that we have all of the user_args #
    ####################################################
    # NOTE: keeping individual variables to maintain compatibility
    start_time = 0 # should be int
    start_location = (0.0, 0.0) # should be (lat, lon)
    distance_radius = 0.0 # float miles
    only_free = False # boolean
    transportation = 'driving' # str can be ['driving', 'transit', 'walking']
    # dict to make it easy to pass to other functions
    user_data = {
        'start_time': start_time,
        'start_location': start_location,
        'distance_radius': distance_radius,
        'only_free': only_free,
        'transportation': transportation
    }

    ####################################################################
    # Step 1: Estimate the number of events that we will likely select #
    #         within this itinerary                                    #
    ####################################################################
    avg_mins_per_event = 120
    est_num_events = ((24 * 60) - start_time) / avg_mins_per_event

    ######################################################################
    # Step 2: Retrieve events from the database based on the user id and #
    #         the ratio of categories to get, then remove bad events and #
    #         return back a list of events in the form:                  #
    #         [[event, venue], [event, venue], [event, venue], ...]      #
    ######################################################################
    events = []
    for e in events:
        assert len(e) == 2, 'ERROR: events in pool should have 2 items in its tuple'

    #########################################################################
    # Step 3: Calculate the distance for each [event, venue] from the start #
    #         location to create [event, venue, distance] and the sort the  #
    #         events by that distance in decreasing distance order          #
    #########################################################################
    events = sort_distances(events)
    for e in events:
        assert len(e) == 3, 'ERROR: post distance calculation the event tuple should have 3 items'

    ########################################################
    # Step 4: Go through the steps to create the itinerary #
    ########################################################
    # manually set the radius for the first iteration
    radius_mem[0] = distance_radius
    radius_mem[1] = distance_radius
    # find first index within that radius
    i = -1
    for x, e in events:
        if e[2] <= radius_mem[1]:
            i = x
            break
    # if still -1 exit the program and return empty itinerary
    if i == -1:
        return itinerary
    # now that we know the index, lets make a copy with just the valid indices
    valid_events = events[i:]
    # lets create the full itinerary now
    cont = True
    while cont:
        # try to increment the itinerary
        increment_itinerary(itinerary, valid_events, user_data)
        # check if itinerary is finished
        if check_finished(itinerary):
            cont = False
        else:
            # the given itinerary is not done, we need to get a new radius
            # and find the new valid itins based on distance
            if determine_radius(itinerary, itin_mem, radius_mem, user_data):
                cont = False
            else:
                # find first index within that radius
                i = -1
                for x, e in events:
                    if e[2] <= radius_mem[1]:
                        i = x
                        break
                if i == -1:
                    valid_events = []
                else:
                    valid_events = events[i:]
    # we are done creating the itinerary
    # run some final validity checks here
    
    # return the itinerary
    for i, item in enumerate(itinerary):
        # change events to event id
        itinerary[i][0] = item[0]['event_id']
        # change venues to venue id
        itinerary[i][1] = item[1]['venue_id']

        assert len(itinerary[i]) == 4, 'ERROR: Itinerary item has wrong number of items'

    return itinerary
