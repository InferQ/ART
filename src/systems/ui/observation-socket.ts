// src/systems/ui/observation-socket.ts
import { TypedSocket } from './typed-socket';
import { Observation, ObservationType, ObservationFilter } from '@/types';
import { Logger } from '@/utils/logger';
import { IObservationRepository } from '@/core/interfaces'; // Assuming this exists

/**
 * A specialized `TypedSocket` designed for handling `Observation` data streams.
 * 
 * @remarks
 * This socket acts as the bridge between the agent's internal `ObservationManager` and the external UI or monitoring systems.
 * It extends the generic `TypedSocket` to provide:
 * 1. **Type-Safe Notification**: Specifically handles `Observation` objects.
 * 2. **Specialized Filtering**: Allows subscribers to filter events by `ObservationType` (e.g., only subscribe to 'TOOL_EXECUTION' or 'THOUGHTS').
 * 3. **Historical Access**: Provides a `getHistory` method that leverages the `IObservationRepository` to fetch past observations, enabling UIs to populate initial state.
 * 
 * This class is a key component of the `UISystem`.
 */
export class ObservationSocket extends TypedSocket<Observation, ObservationType | ObservationType[]> {
  private observationRepository?: IObservationRepository;

  /**
   * Creates an instance of ObservationSocket.
   * @param observationRepository - Optional repository for fetching observation history. If not provided, `getHistory` will return empty arrays.
   */
  constructor(observationRepository?: IObservationRepository) {
    super(); // No logger instance needed
    this.observationRepository = observationRepository;
    Logger.debug('ObservationSocket initialized.');
  }

  /**
   * Notifies all eligible subscribers about a new observation.
   * 
   * @remarks
   * This method is called by the `ObservationManager` whenever a new observation is recorded.
   * It iterates through all active subscriptions and invokes their callbacks if:
   * 1. The subscriber's `targetThreadId` (if any) matches the observation's `threadId`.
   * 2. The subscriber's `filter` (if any) matches the observation's `type`.
   * 
   * @param observation - The new `Observation` object to broadcast.
   */
  notifyObservation(observation: Observation): void {
    Logger.debug(`Notifying Observation: ${observation.id} (${observation.type}) for thread ${observation.threadId}`);
    super.notify(
      observation,
      { targetThreadId: observation.threadId },
      (data, filter) => {
        if (!filter) return true; // No filter, always notify
        if (Array.isArray(filter)) {
          return filter.includes(data.type); // Check if type is in the array
        }
        return data.type === filter; // Check for single type match
      }
    );
  }

  /**
   * Retrieves historical observations from the underlying repository.
   * 
   * @remarks
   * This is typically used by UIs when they first connect to a thread to backfill the event log.
   * It translates the socket's filter criteria into an `ObservationFilter` compatible with the repository.
   * 
   * @param filter - Optional `ObservationType` or array of types to filter the history by.
   * @param options - Required object containing `threadId` and optional `limit`.
   * @returns A promise resolving to an array of `Observation` objects matching the criteria.
   */
  async getHistory(
    filter?: ObservationType | ObservationType[],
    options?: { threadId?: string; limit?: number }
  ): Promise<Observation[]> {
    if (!this.observationRepository) {
      Logger.warn('Cannot getHistory for ObservationSocket: ObservationRepository not configured.');
      return [];
    }
    if (!options?.threadId) {
      Logger.warn('Cannot getHistory for ObservationSocket: threadId is required.');
      return [];
    }

    Logger.debug(`Getting history for ObservationSocket: Thread ${options.threadId}, Filter: ${JSON.stringify(filter)}, Limit: ${options.limit}`);

    // Construct the ObservationFilter for the repository method
    const observationFilter: ObservationFilter = {};

    if (filter) {
      observationFilter.types = Array.isArray(filter) ? filter : [filter];
    }
    // Note: The limit option is not part of the ObservationFilter type directly in all versions,
    // but the repository implementation is expected to handle it if passed or slice the results.
    // For this implementation, we rely on the repository to potentially handle limits or we just fetch based on filter.
    if (options.limit !== undefined) {
       Logger.debug(`Limit requested: ${options.limit}. Repository implementation logic applies.`);
    }


    try {
      // Call the repository method
      const observations = await this.observationRepository.getObservations(
        options.threadId,
        observationFilter
      );
      // The repository method returns observations sorted chronologically (ascending).
      // We return them as is.
      return observations;
    } catch (error) {
      Logger.error(`Error fetching observation history for thread ${options.threadId} with filter ${JSON.stringify(observationFilter)}:`, error);
      return [];
    }
  }
}