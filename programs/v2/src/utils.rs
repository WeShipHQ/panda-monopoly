use pinocchio::{
    account_info::AccountInfo,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvars::{clock::Clock, Sysvar},
};

/// Verify a PDA matches expected seeds
pub fn verify_pda(
    account: &AccountInfo,
    program_id: &Pubkey,
    seeds: &[&[u8]],
    error: ProgramError,
) -> Result<u8, ProgramError> {
    use pinocchio::pubkey::find_program_address;
    let (expected_key, bump) = find_program_address(seeds, program_id);
    if account.key() != &expected_key {
        return Err(error);
    }
    Ok(bump)
}

/// Check if an account is a signer
pub fn check_signer(account: &AccountInfo, error: ProgramError) -> Result<(), ProgramError> {
    if !account.is_signer() {
        return Err(error);
    }
    Ok(())
}

/// Check if an account is writable
pub fn check_writable(account: &AccountInfo, error: ProgramError) -> Result<(), ProgramError> {
    if !account.is_writable() {
        return Err(error);
    }
    Ok(())
}

/// Check if an account is owned by the program
pub fn check_owner(
    account: &AccountInfo,
    expected_owner: &Pubkey,
    error: ProgramError,
) -> Result<(), ProgramError> {
    if account.owner() != expected_owner {
        return Err(error);
    }
    Ok(())
}

/// Transfer lamports from one account to another
pub fn transfer_lamports(
    from: &AccountInfo,
    to: &AccountInfo,
    amount: u64,
) -> Result<(), ProgramError> {
    if amount == 0 {
        return Ok(());
    }

    let from_lamports = from.lamports();
    let to_lamports = to.lamports();

    if from_lamports < amount {
        return Err(ProgramError::InsufficientFunds);
    }

    unsafe {
        *from.borrow_mut_lamports_unchecked() = from_lamports - amount;
        *to.borrow_mut_lamports_unchecked() = to_lamports + amount;
    }

    Ok(())
}

/// Create a new account via CPI to system program
/// Note: This is a simplified version. Full implementation would require
/// proper instruction building and CPI handling.
pub fn create_account(
    _payer: &AccountInfo,
    _new_account: &AccountInfo,
    _space: u64,
    _owner: &Pubkey,
    _seeds: &[&[u8]],
    _system_program: &AccountInfo,
) -> Result<(), ProgramError> {
    // TODO: Implement proper CPI to system program
    // This requires building the create_account instruction manually
    Err(ProgramError::Custom(6095)) // FeatureNotImplemented
}

/// Get current clock timestamp
pub fn get_clock_timestamp() -> Result<i64, ProgramError> {
    let clock = Clock::get()?;
    Ok(clock.unix_timestamp)
}

/// Get current slot
pub fn get_clock_slot() -> Result<u64, ProgramError> {
    let clock = Clock::get()?;
    Ok(clock.slot)
}

/// Read data from account with proper bounds checking
pub fn read_account_data<T>(account: &AccountInfo) -> Result<&T, ProgramError>
where
    T: Sized,
{
    let data = account.try_borrow_data()?;
    if data.len() < core::mem::size_of::<T>() {
        return Err(ProgramError::AccountDataTooSmall);
    }
    
    unsafe {
        let ptr = data.as_ptr() as *const T;
        Ok(&*ptr)
    }
}

/// Read mutable data from account with proper bounds checking
pub fn read_account_data_mut<T>(account: &AccountInfo) -> Result<&mut T, ProgramError>
where
    T: Sized,
{
    let mut data = account.try_borrow_mut_data()?;
    if data.len() < core::mem::size_of::<T>() {
        return Err(ProgramError::AccountDataTooSmall);
    }
    
    unsafe {
        let ptr = data.as_mut_ptr() as *mut T;
        Ok(&mut *ptr)
    }
}

/// Check if two pubkeys are equal
#[inline(always)]
pub fn pubkeys_equal(a: &[u8; 32], b: &[u8; 32]) -> bool {
    a == b
}

/// Copy pubkey bytes
#[inline(always)]
pub fn copy_pubkey(dest: &mut [u8; 32], src: &[u8; 32]) {
    dest.copy_from_slice(src);
}

/// Zero out pubkey
#[inline(always)]
pub fn zero_pubkey(dest: &mut [u8; 32]) {
    *dest = [0u8; 32];
}

/// Convert Option<Pubkey> to flag and bytes
pub fn option_pubkey_to_bytes(opt: Option<&Pubkey>) -> (u8, [u8; 32]) {
    match opt {
        Some(pk) => {
            let mut bytes = [0u8; 32];
            bytes.copy_from_slice(pk.as_ref());
            (1, bytes)
        }
        None => (0, [0u8; 32]),
    }
}

/// Convert flag and bytes to Option<Pubkey>
pub fn bytes_to_option_pubkey(flag: u8, bytes: &[u8; 32]) -> Option<Pubkey> {
    if flag == 0 {
        None
    } else {
        Some(Pubkey::from(*bytes))
    }
}
