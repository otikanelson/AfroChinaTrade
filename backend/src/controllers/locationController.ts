import { Request, Response } from 'express';
import { getAllStates, getLGAsForState } from '../data/nigerianStatesLGAs';

// Get all Nigerian states
export const getStates = async (req: Request, res: Response): Promise<void> => {
  try {
    const states = getAllStates();
    res.status(200).json({
      status: 'success',
      data: states
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch states',
      errorCode: 'FETCH_STATES_ERROR'
    });
  }
};

// Get LGAs for a specific state
export const getLGAs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state } = req.params;

    if (!state) {
      res.status(400).json({
        status: 'error',
        message: 'State parameter is required',
        errorCode: 'MISSING_STATE'
      });
      return;
    }

    const lgas = getLGAsForState(state);

    if (lgas.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'State not found',
        errorCode: 'STATE_NOT_FOUND'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: lgas
    });
  } catch (error) {
    console.error('Error fetching LGAs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch LGAs',
      errorCode: 'FETCH_LGAS_ERROR'
    });
  }
};
