import traci

# Start SUMO with TraCI
traci.start(["sumo-gui", "-c", "mySimulation.sumocfg"])

# Simulation loop
while traci.simulation.getMinExpectedNumber() > 0:
    # Change traffic light state
    traci.trafficlight.setRedYellowGreenState("tl1", "GrGr")  # Set green for all directions
    traci.simulationStep()  # Advance the simulation by one step

# Close TraCI
traci.close()