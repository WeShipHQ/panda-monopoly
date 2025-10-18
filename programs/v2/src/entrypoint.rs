use pinocchio::{
    account_info::AccountInfo,
    entrypoint,
    msg,
    ProgramResult,
    pubkey::Pubkey,
};

use crate::processor::Processor;

entrypoint!(process_instruction);
// Note: entrypoint! macro includes default_allocator and default_panic_handler

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    Processor::process(program_id, accounts, instruction_data)
}
